/*
 * Copyright 2015 Blue Circle Software, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.bluecirclesoft.open.jigen.inputJackson;

import com.bluecirclesoft.open.jigen.model.JAny;
import com.bluecirclesoft.open.jigen.model.JArray;
import com.bluecirclesoft.open.jigen.model.JBoolean;
import com.bluecirclesoft.open.jigen.model.JEnum;
import com.bluecirclesoft.open.jigen.model.JMap;
import com.bluecirclesoft.open.jigen.model.JNumber;
import com.bluecirclesoft.open.jigen.model.JSpecialization;
import com.bluecirclesoft.open.jigen.model.JString;
import com.bluecirclesoft.open.jigen.model.JType;
import com.bluecirclesoft.open.jigen.model.JTypeVariable;
import com.bluecirclesoft.open.jigen.model.JVoid;
import com.bluecirclesoft.open.jigen.model.Model;
import com.bluecirclesoft.open.jigen.model.PropertyEnumerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonAnyFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonArrayFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonBooleanFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonFormatTypes;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonFormatVisitable;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonFormatVisitorWrapper;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonIntegerFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonMapFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonNullFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonNumberFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonObjectFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonStringFormatVisitor;
import com.fasterxml.jackson.databind.jsonFormatVisitors.JsonValueFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * Imports the information about a given type into the Model using Jackson.
 */
public class JacksonTypeModeller implements PropertyEnumerator {

	private static final Logger logger = LoggerFactory.getLogger(JacksonTypeModeller.class);

	private static final Map<Class, Supplier<JType>> FUNDAMENTAL_TYPES = new HashMap<>();

	static {
		FUNDAMENTAL_TYPES.put(Void.class, JVoid::new);
		FUNDAMENTAL_TYPES.put(Void.TYPE, JVoid::new);

		FUNDAMENTAL_TYPES.put(Boolean.class, JBoolean::new);
		FUNDAMENTAL_TYPES.put(Boolean.TYPE, JBoolean::new);

		FUNDAMENTAL_TYPES.put(Byte.class, JNumber::new);
		FUNDAMENTAL_TYPES.put(Byte.TYPE, JNumber::new);
		FUNDAMENTAL_TYPES.put(Short.class, JNumber::new);
		FUNDAMENTAL_TYPES.put(Short.TYPE, JNumber::new);
		FUNDAMENTAL_TYPES.put(Integer.class, JNumber::new);
		FUNDAMENTAL_TYPES.put(Integer.TYPE, JNumber::new);
		FUNDAMENTAL_TYPES.put(Long.class, JNumber::new);
		FUNDAMENTAL_TYPES.put(Long.TYPE, JNumber::new);
		FUNDAMENTAL_TYPES.put(Float.class, JNumber::new);
		FUNDAMENTAL_TYPES.put(Float.TYPE, JNumber::new);
		FUNDAMENTAL_TYPES.put(Double.class, JNumber::new);
		FUNDAMENTAL_TYPES.put(Double.TYPE, JNumber::new);
		FUNDAMENTAL_TYPES.put(BigInteger.class, JNumber::new);
		FUNDAMENTAL_TYPES.put(BigDecimal.class, JNumber::new);

		FUNDAMENTAL_TYPES.put(String.class, JString::new);
		FUNDAMENTAL_TYPES.put(Character.class, JString::new);
		FUNDAMENTAL_TYPES.put(Character.TYPE, JString::new);
	}

	private final Map<Type, JType> processedTypes = new HashMap<>();

	private final ArrayDeque<Type> typesToProcess = new ArrayDeque<>();

	private final Map<Type, List<Consumer<JType>>> typeFixups = new HashMap<>();

	void addFixup(Type type, Consumer<JType> fixup) {
		List<Consumer<JType>> list = typeFixups.get(type);
		if (list == null) {
			list = new ArrayList<>();
			typeFixups.put(type, list);
		}
		list.add(fixup);
	}

	void queueType(Type type) {
		typesToProcess.add(type);
	}

	@Override
	public void enumerateProperties(Model model, Type... types) {

		Collections.addAll(typesToProcess, types);

		Set<Type> addedThisSession = new HashSet<>();

		while (!typesToProcess.isEmpty()) {
			Type type = typesToProcess.pollFirst();
			if (processedTypes.containsKey(type)) {
				continue;
			}
			processedTypes.put(type, handleType(type));
			addedThisSession.add(type);
		}
		for (Map.Entry<Type, List<Consumer<JType>>> fixup : typeFixups.entrySet()) {
			JType jTYpe = processedTypes.get(fixup.getKey());
			for (Consumer<JType> processor : fixup.getValue()) {
				processor.accept(jTYpe);
			}
		}
		for (Type type : addedThisSession) {
			model.addType(type, processedTypes.get(type));
		}
		logger.info("Done");
	}

	private JType handleType(Type type) {
		if (type instanceof TypeVariable) {
			TypeVariable variable = (TypeVariable) type;
			JTypeVariable jVariable = new JTypeVariable(variable.getName());
			// if the bound is only Object, we're going to ignore it
			if (variable.getBounds().length != 1 || variable.getBounds()[0] != Object.class) {
				for (int i = 0; i < variable.getBounds().length; i++) {
					final int finalI = i;
					Type bound = variable.getBounds()[i];
					jVariable.getIntersectionBounds().add(null);
					queueType(bound);
					addFixup(bound, jType -> jVariable.getIntersectionBounds().set(finalI, jType));
				}
			}
			return jVariable;
		} else if (type instanceof ParameterizedType) {
			// parametrized type - type with type parameters (e.g. List<Integer>)
			ParameterizedType pt = (ParameterizedType) type;
			Type base = pt.getRawType();
			if (isCollection(base)) {
				JArray result = new JArray();
				result.setIndexType(new JNumber());
				addFixup(pt.getActualTypeArguments()[0], result::setElementType);
				queueType(pt.getActualTypeArguments()[0]);
				return result;
			} else if (isMap(base)) {
				JMap result = new JMap();
				addFixup(pt.getActualTypeArguments()[1], result::setValueType);
				queueType(pt.getActualTypeArguments()[1]);
				return result;
			} else {
				JSpecialization jSpecialization = new JSpecialization();
				jSpecialization.setParameters(new JType[pt.getActualTypeArguments().length]);
				addFixup(pt.getRawType(), jSpecialization::setBase);
				queueType(pt.getRawType());
				for (int i = 0; i < pt.getActualTypeArguments().length; i++) {
					final int finalI = i;
					addFixup(pt.getActualTypeArguments()[i],
							jType -> jSpecialization.getParameters()[finalI] = jType);
					queueType(pt.getActualTypeArguments()[i]);
				}
				return jSpecialization;
			}
		} else if (type instanceof Class) {
			if (FUNDAMENTAL_TYPES.containsKey(type)) {
				return FUNDAMENTAL_TYPES.get(type).get();
			} else {
				return handleUserDefinedClass((Class) type);
			}
		} else {
			throw new RuntimeException("Can't handle " + type);
		}
	}

	private boolean isMap(Type base) {
		return base instanceof Class && Map.class.isAssignableFrom((Class<?>) base);
	}


	private boolean isCollection(Type base) {
		return base instanceof Class && Collection.class.isAssignableFrom((Class<?>) base);
	}

	private JType handleUserDefinedClass(Class type) {

		final TypeReadingVisitor<?>[] reader = {null};
		try {
			JsonFormatVisitorWrapper wrapper = new JsonFormatVisitorWrapper.Base() {

				@Override
				public JsonArrayFormatVisitor expectArrayFormat(JavaType type)
						throws JsonMappingException {
					return new JsonArrayFormatVisitor.Base() {
						@Override
						public void itemsFormat(JsonFormatVisitable handler, JavaType elementType)
								throws JsonMappingException {
							super.itemsFormat(handler, elementType);
						}

						@Override
						public void itemsFormat(JsonFormatTypes format)
								throws JsonMappingException {
							super.itemsFormat(format);
						}
					};
				}

				@Override
				public JsonStringFormatVisitor expectStringFormat(JavaType type)
						throws JsonMappingException {
					reader[0] = JString::new;
					return new JsonStringFormatVisitor.Base() {
						@Override
						public void enumTypes(Set<String> enums) {
							reader[0] = () -> new JEnum(type.getRawClass().getName(), enums);
						}
					};
				}

				@Override
				public JsonNumberFormatVisitor expectNumberFormat(JavaType type)
						throws JsonMappingException {
					reader[0] = JNumber::new;
					return new JsonNumberFormatVisitor() {
						@Override
						public void numberType(JsonParser.NumberType type) {
							throw new RuntimeException("not implemented");
						}

						@Override
						public void format(JsonValueFormat format) {
							throw new RuntimeException("not implemented");
						}

						@Override
						public void enumTypes(Set<String> enums) {
							throw new RuntimeException("not implemented");
						}
					};
				}

				@Override
				public JsonIntegerFormatVisitor expectIntegerFormat(JavaType type)
						throws JsonMappingException {
					reader[0] = JNumber::new;
					return new JsonIntegerFormatVisitor.Base() {
					};
				}

				@Override
				public JsonBooleanFormatVisitor expectBooleanFormat(JavaType type)
						throws JsonMappingException {
					reader[0] = JNumber::new;
					return new JsonBooleanFormatVisitor.Base() {
					};
				}

				@Override
				public JsonNullFormatVisitor expectNullFormat(JavaType type)
						throws JsonMappingException {
					reader[0] = JNumber::new;
					return new JsonNullFormatVisitor.Base() {
					};
				}

				@Override
				public JsonAnyFormatVisitor expectAnyFormat(JavaType type)
						throws JsonMappingException {
					reader[0] = JAny::new;
					return new JsonAnyFormatVisitor.Base() {
					};
				}

				@Override
				public JsonMapFormatVisitor expectMapFormat(JavaType type)
						throws JsonMappingException {
					// We would only have gotten here for a raw map; it's element type is any
					JMap map = new JMap(new JAny());
					reader[0] = () -> map;
					return new JsonMapFormatVisitor.Base() {
					};
				}

				@Override
				public JsonObjectFormatVisitor expectObjectFormat(JavaType type)
						throws JsonMappingException {
					JsonObjectReader myReader =
							new JsonObjectReader(JacksonTypeModeller.this, type.getRawClass());
					reader[0] = myReader;
					return myReader;
				}
			};
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.acceptJsonFormatVisitor(type, wrapper);
		} catch (JsonMappingException e) {
			throw new RuntimeException(e);  // TODO generated stub
		}
		if (reader[0] == null) {
			return null;
		} else {
			return reader[0].getResult();
		}
	}


}
