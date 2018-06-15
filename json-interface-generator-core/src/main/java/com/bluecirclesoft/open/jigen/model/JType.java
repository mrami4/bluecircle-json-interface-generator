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

package com.bluecirclesoft.open.jigen.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * TODO document me
 */
abstract public class JType implements Serializable {

	// TODO debugging only

	public static List<JType> createdTypes = new ArrayList<>();

	abstract public <T> T accept(JTypeVisitor<T> visitor);

	abstract public boolean needsWrapping();

	public JType getStripped() {
		return this;
	}

	public boolean isConstructible() {
		return false;
	}

	public boolean canBeNull() {
		return false;
	}

	public boolean canBeUndefined() {
		return false;
	}
}
