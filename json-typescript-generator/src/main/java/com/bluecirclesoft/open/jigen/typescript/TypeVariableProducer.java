/*
 * Copyright 2018 Blue Circle Software, LLC
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

package com.bluecirclesoft.open.jigen.typescript;

import com.bluecirclesoft.open.jigen.model.JAny;
import com.bluecirclesoft.open.jigen.model.JArray;
import com.bluecirclesoft.open.jigen.model.JBoolean;
import com.bluecirclesoft.open.jigen.model.JEnum;
import com.bluecirclesoft.open.jigen.model.JMap;
import com.bluecirclesoft.open.jigen.model.JNull;
import com.bluecirclesoft.open.jigen.model.JNumber;
import com.bluecirclesoft.open.jigen.model.JObject;
import com.bluecirclesoft.open.jigen.model.JSpecialization;
import com.bluecirclesoft.open.jigen.model.JString;
import com.bluecirclesoft.open.jigen.model.JType;
import com.bluecirclesoft.open.jigen.model.JTypeVariable;
import com.bluecirclesoft.open.jigen.model.JTypeVisitor;
import com.bluecirclesoft.open.jigen.model.JUnionType;
import com.bluecirclesoft.open.jigen.model.JVoid;
import com.bluecirclesoft.open.jigen.model.JWildcard;

/**
 * TODO document me
 */
public class TypeVariableProducer implements JTypeVisitor<String> {

	private final UsageLocation location;

	private final String immutableSuffix;

	private final boolean useUnknown;

	public TypeVariableProducer(UsageLocation location, String immutableSuffix, boolean useUnknown) {
		this.location = location;
		this.immutableSuffix = immutableSuffix;
		this.useUnknown = useUnknown;
	}

	@Override
	public String visit(JObject jObject) {
		StringBuilder sb = new StringBuilder();
		sb.append(jObject.getName());
		if (immutableSuffix != null) {
			sb.append(immutableSuffix);
		}
		if (!jObject.getTypeVariables().isEmpty()) {
			sb.append("<");
			boolean needsComma = false;
			for (JTypeVariable var : jObject.getTypeVariables()) {
				if (needsComma) {
					sb.append(", ");
				} else {
					needsComma = true;
				}
				sb.append(var.accept(this));
			}
			sb.append(">");
		}
		return sb.toString();
	}

	@Override
	public String visit(JAny jAny) {
		return useUnknown ? "unknown" : "any";
	}

	@Override
	public String visit(JArray jArray) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JBoolean jBoolean) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JEnum jEnum) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JNumber jNumber) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JString jString) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JVoid jVoid) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JSpecialization jSpecialization) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JTypeVariable var) {
		StringBuilder sb = new StringBuilder();
		sb.append(var.getName());
		// if you have a type like MyType<T extends OtherType>, TypeScript only allows the extends clause when the type is being declared.
		if (location == UsageLocation.DEFINITION) {
			if (!var.getIntersectionBounds().isEmpty()) {
				sb.append(" extends ");
				boolean needsAmpersand = false;
				for (JType bound : var.getIntersectionBounds()) {
					if (needsAmpersand) {
						sb.append("&");
					} else {
						needsAmpersand = true;
					}
					sb.append(bound.accept(this));
				}
			}
		}
		return sb.toString();
	}

	@Override
	public String visit(JMap jMap) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JUnionType jUnionType) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JNull jNull) {
		throw new RuntimeException("not implemented");
	}

	@Override
	public String visit(JWildcard jWildcard) {
		throw new RuntimeException("not implemented");
	}
}
