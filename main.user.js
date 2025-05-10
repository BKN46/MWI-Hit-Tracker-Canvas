
// ==UserScript==
// @name           MWI-Hit-Tracker-Canvas
// @namespace      MWI-Hit-Tracker-Canvas
// @version        0.9.5
// @author         Artintel, BKN46
// @description    A Tampermonkey script to track MWI hits on Canvas
// @icon           https://www.milkywayidle.com/favicon.svg
// @include        https://*.milkywayidle.com/*
// @match          https://www.milkywayidle.com/*
// @license        MIT
// ==/UserScript==
(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global$c =
	  // eslint-disable-next-line es/no-global-this -- safe
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  // eslint-disable-next-line no-restricted-globals -- safe
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();

	var objectGetOwnPropertyDescriptor = {};

	var fails$8 = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var fails$7 = fails$8;

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails$7(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var objectPropertyIsEnumerable = {};

	var $propertyIsEnumerable = {}.propertyIsEnumerable;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor$1 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor$1(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable;

	var createPropertyDescriptor$2 = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw$1 = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var fails$6 = fails$8;
	var classof$2 = classofRaw$1;

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails$6(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classof$2(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible$2 = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings
	var IndexedObject = indexedObject;
	var requireObjectCoercible$1 = requireObjectCoercible$2;

	var toIndexedObject$3 = function (it) {
	  return IndexedObject(requireObjectCoercible$1(it));
	};

	// `IsCallable` abstract operation
	// https://tc39.es/ecma262/#sec-iscallable
	var isCallable$d = function (argument) {
	  return typeof argument === 'function';
	};

	var isCallable$c = isCallable$d;

	var isObject$5 = function (it) {
	  return typeof it === 'object' ? it !== null : isCallable$c(it);
	};

	var global$b = global$c;
	var isCallable$b = isCallable$d;

	var aFunction = function (argument) {
	  return isCallable$b(argument) ? argument : undefined;
	};

	var getBuiltIn$4 = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(global$b[namespace]) : global$b[namespace] && global$b[namespace][method];
	};

	var getBuiltIn$3 = getBuiltIn$4;

	var engineUserAgent = getBuiltIn$3('navigator', 'userAgent') || '';

	var global$a = global$c;
	var userAgent = engineUserAgent;

	var process = global$a.process;
	var Deno = global$a.Deno;
	var versions = process && process.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] < 4 ? 1 : match[0] + match[1];
	} else if (userAgent) {
	  match = userAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	/* eslint-disable es/no-symbol -- required for testing */

	var V8_VERSION = engineV8Version;
	var fails$5 = fails$8;

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$5(function () {
	  var symbol = Symbol();
	  // Chrome 38 Symbol has incorrect toString conversion
	  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
	  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
	});

	/* eslint-disable es/no-symbol -- required for testing */

	var NATIVE_SYMBOL$1 = nativeSymbol;

	var useSymbolAsUid = NATIVE_SYMBOL$1
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';

	var isCallable$a = isCallable$d;
	var getBuiltIn$2 = getBuiltIn$4;
	var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

	var isSymbol$2 = USE_SYMBOL_AS_UID$1 ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  var $Symbol = getBuiltIn$2('Symbol');
	  return isCallable$a($Symbol) && Object(it) instanceof $Symbol;
	};

	var tryToString$1 = function (argument) {
	  try {
	    return String(argument);
	  } catch (error) {
	    return 'Object';
	  }
	};

	var isCallable$9 = isCallable$d;
	var tryToString = tryToString$1;

	// `Assert: IsCallable(argument) is true`
	var aCallable$5 = function (argument) {
	  if (isCallable$9(argument)) return argument;
	  throw TypeError(tryToString(argument) + ' is not a function');
	};

	var aCallable$4 = aCallable$5;

	// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	var getMethod$4 = function (V, P) {
	  var func = V[P];
	  return func == null ? undefined : aCallable$4(func);
	};

	var isCallable$8 = isCallable$d;
	var isObject$4 = isObject$5;

	// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	var ordinaryToPrimitive$1 = function (input, pref) {
	  var fn, val;
	  if (pref === 'string' && isCallable$8(fn = input.toString) && !isObject$4(val = fn.call(input))) return val;
	  if (isCallable$8(fn = input.valueOf) && !isObject$4(val = fn.call(input))) return val;
	  if (pref !== 'string' && isCallable$8(fn = input.toString) && !isObject$4(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var shared$3 = {exports: {}};

	var global$9 = global$c;

	var setGlobal$3 = function (key, value) {
	  try {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty(global$9, key, { value: value, configurable: true, writable: true });
	  } catch (error) {
	    global$9[key] = value;
	  } return value;
	};

	var global$8 = global$c;
	var setGlobal$2 = setGlobal$3;

	var SHARED = '__core-js_shared__';
	var store$3 = global$8[SHARED] || setGlobal$2(SHARED, {});

	var sharedStore = store$3;

	var store$2 = sharedStore;

	(shared$3.exports = function (key, value) {
	  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.18.3',
	  mode: 'global',
	  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
	});

	var requireObjectCoercible = requireObjectCoercible$2;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject$2 = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var toObject$1 = toObject$2;

	var hasOwnProperty = {}.hasOwnProperty;

	// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
	  return hasOwnProperty.call(toObject$1(it), key);
	};

	var id = 0;
	var postfix = Math.random();

	var uid$2 = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var global$7 = global$c;
	var shared$2 = shared$3.exports;
	var hasOwn$8 = hasOwnProperty_1;
	var uid$1 = uid$2;
	var NATIVE_SYMBOL = nativeSymbol;
	var USE_SYMBOL_AS_UID = useSymbolAsUid;

	var WellKnownSymbolsStore = shared$2('wks');
	var Symbol$1 = global$7.Symbol;
	var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;

	var wellKnownSymbol$8 = function (name) {
	  if (!hasOwn$8(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
	    if (NATIVE_SYMBOL && hasOwn$8(Symbol$1, name)) {
	      WellKnownSymbolsStore[name] = Symbol$1[name];
	    } else {
	      WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	    }
	  } return WellKnownSymbolsStore[name];
	};

	var isObject$3 = isObject$5;
	var isSymbol$1 = isSymbol$2;
	var getMethod$3 = getMethod$4;
	var ordinaryToPrimitive = ordinaryToPrimitive$1;
	var wellKnownSymbol$7 = wellKnownSymbol$8;

	var TO_PRIMITIVE = wellKnownSymbol$7('toPrimitive');

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	var toPrimitive$1 = function (input, pref) {
	  if (!isObject$3(input) || isSymbol$1(input)) return input;
	  var exoticToPrim = getMethod$3(input, TO_PRIMITIVE);
	  var result;
	  if (exoticToPrim) {
	    if (pref === undefined) pref = 'default';
	    result = exoticToPrim.call(input, pref);
	    if (!isObject$3(result) || isSymbol$1(result)) return result;
	    throw TypeError("Can't convert object to primitive value");
	  }
	  if (pref === undefined) pref = 'number';
	  return ordinaryToPrimitive(input, pref);
	};

	var toPrimitive = toPrimitive$1;
	var isSymbol = isSymbol$2;

	// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	var toPropertyKey$2 = function (argument) {
	  var key = toPrimitive(argument, 'string');
	  return isSymbol(key) ? key : String(key);
	};

	var global$6 = global$c;
	var isObject$2 = isObject$5;

	var document$1 = global$6.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS$1 = isObject$2(document$1) && isObject$2(document$1.createElement);

	var documentCreateElement$1 = function (it) {
	  return EXISTS$1 ? document$1.createElement(it) : {};
	};

	var DESCRIPTORS$5 = descriptors;
	var fails$4 = fails$8;
	var createElement = documentCreateElement$1;

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !DESCRIPTORS$5 && !fails$4(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- requied for testing
	  return Object.defineProperty(createElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var DESCRIPTORS$4 = descriptors;
	var propertyIsEnumerableModule = objectPropertyIsEnumerable;
	var createPropertyDescriptor$1 = createPropertyDescriptor$2;
	var toIndexedObject$2 = toIndexedObject$3;
	var toPropertyKey$1 = toPropertyKey$2;
	var hasOwn$7 = hasOwnProperty_1;
	var IE8_DOM_DEFINE$1 = ie8DomDefine;

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	objectGetOwnPropertyDescriptor.f = DESCRIPTORS$4 ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject$2(O);
	  P = toPropertyKey$1(P);
	  if (IE8_DOM_DEFINE$1) try {
	    return $getOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (hasOwn$7(O, P)) return createPropertyDescriptor$1(!propertyIsEnumerableModule.f.call(O, P), O[P]);
	};

	var objectDefineProperty = {};

	var isObject$1 = isObject$5;

	// `Assert: Type(argument) is Object`
	var anObject$b = function (argument) {
	  if (isObject$1(argument)) return argument;
	  throw TypeError(String(argument) + ' is not an object');
	};

	var DESCRIPTORS$3 = descriptors;
	var IE8_DOM_DEFINE = ie8DomDefine;
	var anObject$a = anObject$b;
	var toPropertyKey = toPropertyKey$2;

	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	objectDefineProperty.f = DESCRIPTORS$3 ? $defineProperty : function defineProperty(O, P, Attributes) {
	  anObject$a(O);
	  P = toPropertyKey(P);
	  anObject$a(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return $defineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var DESCRIPTORS$2 = descriptors;
	var definePropertyModule$2 = objectDefineProperty;
	var createPropertyDescriptor = createPropertyDescriptor$2;

	var createNonEnumerableProperty$5 = DESCRIPTORS$2 ? function (object, key, value) {
	  return definePropertyModule$2.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var redefine$3 = {exports: {}};

	var isCallable$7 = isCallable$d;
	var store$1 = sharedStore;

	var functionToString = Function.toString;

	// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if (!isCallable$7(store$1.inspectSource)) {
	  store$1.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource$2 = store$1.inspectSource;

	var global$5 = global$c;
	var isCallable$6 = isCallable$d;
	var inspectSource$1 = inspectSource$2;

	var WeakMap$1 = global$5.WeakMap;

	var nativeWeakMap = isCallable$6(WeakMap$1) && /native code/.test(inspectSource$1(WeakMap$1));

	var shared$1 = shared$3.exports;
	var uid = uid$2;

	var keys = shared$1('keys');

	var sharedKey$3 = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys$4 = {};

	var NATIVE_WEAK_MAP = nativeWeakMap;
	var global$4 = global$c;
	var isObject = isObject$5;
	var createNonEnumerableProperty$4 = createNonEnumerableProperty$5;
	var hasOwn$6 = hasOwnProperty_1;
	var shared = sharedStore;
	var sharedKey$2 = sharedKey$3;
	var hiddenKeys$3 = hiddenKeys$4;

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var WeakMap = global$4.WeakMap;
	var set, get, has;

	var enforce = function (it) {
	  return has(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (NATIVE_WEAK_MAP || shared.state) {
	  var store = shared.state || (shared.state = new WeakMap());
	  var wmget = store.get;
	  var wmhas = store.has;
	  var wmset = store.set;
	  set = function (it, metadata) {
	    if (wmhas.call(store, it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    wmset.call(store, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store, it) || {};
	  };
	  has = function (it) {
	    return wmhas.call(store, it);
	  };
	} else {
	  var STATE = sharedKey$2('state');
	  hiddenKeys$3[STATE] = true;
	  set = function (it, metadata) {
	    if (hasOwn$6(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty$4(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return hasOwn$6(it, STATE) ? it[STATE] : {};
	  };
	  has = function (it) {
	    return hasOwn$6(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var DESCRIPTORS$1 = descriptors;
	var hasOwn$5 = hasOwnProperty_1;

	var FunctionPrototype = Function.prototype;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getDescriptor = DESCRIPTORS$1 && Object.getOwnPropertyDescriptor;

	var EXISTS = hasOwn$5(FunctionPrototype, 'name');
	// additional protection from minified / mangled / dropped function names
	var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
	var CONFIGURABLE = EXISTS && (!DESCRIPTORS$1 || (DESCRIPTORS$1 && getDescriptor(FunctionPrototype, 'name').configurable));

	var functionName = {
	  EXISTS: EXISTS,
	  PROPER: PROPER,
	  CONFIGURABLE: CONFIGURABLE
	};

	var global$3 = global$c;
	var isCallable$5 = isCallable$d;
	var hasOwn$4 = hasOwnProperty_1;
	var createNonEnumerableProperty$3 = createNonEnumerableProperty$5;
	var setGlobal$1 = setGlobal$3;
	var inspectSource = inspectSource$2;
	var InternalStateModule$1 = internalState;
	var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;

	var getInternalState$1 = InternalStateModule$1.get;
	var enforceInternalState = InternalStateModule$1.enforce;
	var TEMPLATE = String(String).split('String');

	(redefine$3.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  var name = options && options.name !== undefined ? options.name : key;
	  var state;
	  if (isCallable$5(value)) {
	    if (String(name).slice(0, 7) === 'Symbol(') {
	      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
	    }
	    if (!hasOwn$4(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
	      createNonEnumerableProperty$3(value, 'name', name);
	    }
	    state = enforceInternalState(value);
	    if (!state.source) {
	      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
	    }
	  }
	  if (O === global$3) {
	    if (simple) O[key] = value;
	    else setGlobal$1(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty$3(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return isCallable$5(this) && getInternalState$1(this).source || inspectSource(this);
	});

	var objectGetOwnPropertyNames = {};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	var toIntegerOrInfinity$2 = function (argument) {
	  var number = +argument;
	  // eslint-disable-next-line no-self-compare -- safe
	  return number !== number || number === 0 ? 0 : (number > 0 ? floor : ceil)(number);
	};

	var toIntegerOrInfinity$1 = toIntegerOrInfinity$2;

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex$1 = function (index, length) {
	  var integer = toIntegerOrInfinity$1(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var toIntegerOrInfinity = toIntegerOrInfinity$2;

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength$1 = function (argument) {
	  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var toLength = toLength$1;

	// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	var lengthOfArrayLike$2 = function (obj) {
	  return toLength(obj.length);
	};

	var toIndexedObject$1 = toIndexedObject$3;
	var toAbsoluteIndex = toAbsoluteIndex$1;
	var lengthOfArrayLike$1 = lengthOfArrayLike$2;

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject$1($this);
	    var length = lengthOfArrayLike$1(O);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var hasOwn$3 = hasOwnProperty_1;
	var toIndexedObject = toIndexedObject$3;
	var indexOf = arrayIncludes.indexOf;
	var hiddenKeys$2 = hiddenKeys$4;

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !hasOwn$3(hiddenKeys$2, key) && hasOwn$3(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (hasOwn$3(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys$3 = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var internalObjectKeys$1 = objectKeysInternal;
	var enumBugKeys$2 = enumBugKeys$3;

	var hiddenKeys$1 = enumBugKeys$2.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es/no-object-getownpropertynames -- safe
	objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return internalObjectKeys$1(O, hiddenKeys$1);
	};

	var objectGetOwnPropertySymbols = {};

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
	objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

	var getBuiltIn$1 = getBuiltIn$4;
	var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
	var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
	var anObject$9 = anObject$b;

	// all object keys, includes non-enumerable and symbols
	var ownKeys$1 = getBuiltIn$1('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = getOwnPropertyNamesModule.f(anObject$9(it));
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var hasOwn$2 = hasOwnProperty_1;
	var ownKeys = ownKeys$1;
	var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
	var definePropertyModule$1 = objectDefineProperty;

	var copyConstructorProperties$1 = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = definePropertyModule$1.f;
	  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!hasOwn$2(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var fails$3 = fails$8;
	var isCallable$4 = isCallable$d;

	var replacement = /#|\.prototype\./;

	var isForced$1 = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : isCallable$4(detection) ? fails$3(detection)
	    : !!detection;
	};

	var normalize = isForced$1.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced$1.data = {};
	var NATIVE = isForced$1.NATIVE = 'N';
	var POLYFILL = isForced$1.POLYFILL = 'P';

	var isForced_1 = isForced$1;

	var global$2 = global$c;
	var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var createNonEnumerableProperty$2 = createNonEnumerableProperty$5;
	var redefine$2 = redefine$3.exports;
	var setGlobal = setGlobal$3;
	var copyConstructorProperties = copyConstructorProperties$1;
	var isForced = isForced_1;

	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	  options.name        - the .name of the function if it does not match the key
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global$2;
	  } else if (STATIC) {
	    target = global$2[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global$2[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty$2(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine$2(target, key, sourceProperty, options);
	  }
	};

	var anInstance$1 = function (it, Constructor, name) {
	  if (it instanceof Constructor) return it;
	  throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	};

	var internalObjectKeys = objectKeysInternal;
	var enumBugKeys$1 = enumBugKeys$3;

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	var objectKeys$1 = Object.keys || function keys(O) {
	  return internalObjectKeys(O, enumBugKeys$1);
	};

	var DESCRIPTORS = descriptors;
	var definePropertyModule = objectDefineProperty;
	var anObject$8 = anObject$b;
	var objectKeys = objectKeys$1;

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	var objectDefineProperties = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject$8(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var getBuiltIn = getBuiltIn$4;

	var html$1 = getBuiltIn('document', 'documentElement');

	/* global ActiveXObject -- old IE, WSH */

	var anObject$7 = anObject$b;
	var defineProperties = objectDefineProperties;
	var enumBugKeys = enumBugKeys$3;
	var hiddenKeys = hiddenKeys$4;
	var html = html$1;
	var documentCreateElement = documentCreateElement$1;
	var sharedKey$1 = sharedKey$3;

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO$1 = sharedKey$1('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    activeXDocument = new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = typeof document != 'undefined'
	    ? document.domain && activeXDocument
	      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
	      : NullProtoObjectViaIFrame()
	    : NullProtoObjectViaActiveX(activeXDocument); // WSH
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO$1] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject$7(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : defineProperties(result, Properties);
	};

	var fails$2 = fails$8;

	var correctPrototypeGetter = !fails$2(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var hasOwn$1 = hasOwnProperty_1;
	var isCallable$3 = isCallable$d;
	var toObject = toObject$2;
	var sharedKey = sharedKey$3;
	var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

	var IE_PROTO = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
	  var object = toObject(O);
	  if (hasOwn$1(object, IE_PROTO)) return object[IE_PROTO];
	  var constructor = object.constructor;
	  if (isCallable$3(constructor) && object instanceof constructor) {
	    return constructor.prototype;
	  } return object instanceof Object ? ObjectPrototype : null;
	};

	var fails$1 = fails$8;
	var isCallable$2 = isCallable$d;
	var getPrototypeOf = objectGetPrototypeOf;
	var redefine$1 = redefine$3.exports;
	var wellKnownSymbol$6 = wellKnownSymbol$8;

	var ITERATOR$2 = wellKnownSymbol$6('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

	/* eslint-disable es/no-array-prototype-keys -- safe */
	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == undefined || fails$1(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype$2[ITERATOR$2].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

	// `%IteratorPrototype%[@@iterator]()` method
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
	if (!isCallable$2(IteratorPrototype$2[ITERATOR$2])) {
	  redefine$1(IteratorPrototype$2, ITERATOR$2, function () {
	    return this;
	  });
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype$2,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	// https://github.com/tc39/proposal-iterator-helpers
	var $$2 = _export;
	var global$1 = global$c;
	var anInstance = anInstance$1;
	var isCallable$1 = isCallable$d;
	var createNonEnumerableProperty$1 = createNonEnumerableProperty$5;
	var fails = fails$8;
	var hasOwn = hasOwnProperty_1;
	var wellKnownSymbol$5 = wellKnownSymbol$8;
	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

	var TO_STRING_TAG$3 = wellKnownSymbol$5('toStringTag');

	var NativeIterator = global$1.Iterator;

	// FF56- have non-standard global helper `Iterator`
	var FORCED = !isCallable$1(NativeIterator)
	  || NativeIterator.prototype !== IteratorPrototype$1
	  // FF44- non-standard `Iterator` passes previous tests
	  || !fails(function () { NativeIterator({}); });

	var IteratorConstructor = function Iterator() {
	  anInstance(this, IteratorConstructor);
	};

	if (!hasOwn(IteratorPrototype$1, TO_STRING_TAG$3)) {
	  createNonEnumerableProperty$1(IteratorPrototype$1, TO_STRING_TAG$3, 'Iterator');
	}

	if (FORCED || !hasOwn(IteratorPrototype$1, 'constructor') || IteratorPrototype$1.constructor === Object) {
	  createNonEnumerableProperty$1(IteratorPrototype$1, 'constructor', IteratorConstructor);
	}

	IteratorConstructor.prototype = IteratorPrototype$1;

	$$2({ global: true, forced: FORCED }, {
	  Iterator: IteratorConstructor
	});

	var iterators = {};

	var wellKnownSymbol$4 = wellKnownSymbol$8;
	var Iterators$1 = iterators;

	var ITERATOR$1 = wellKnownSymbol$4('iterator');
	var ArrayPrototype = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod$1 = function (it) {
	  return it !== undefined && (Iterators$1.Array === it || ArrayPrototype[ITERATOR$1] === it);
	};

	var aCallable$3 = aCallable$5;

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aCallable$3(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var wellKnownSymbol$3 = wellKnownSymbol$8;

	var TO_STRING_TAG$2 = wellKnownSymbol$3('toStringTag');
	var test = {};

	test[TO_STRING_TAG$2] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG_SUPPORT = toStringTagSupport;
	var isCallable = isCallable$d;
	var classofRaw = classofRaw$1;
	var wellKnownSymbol$2 = wellKnownSymbol$8;

	var TO_STRING_TAG$1 = wellKnownSymbol$2('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof$1 = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && isCallable(O.callee) ? 'Arguments' : result;
	};

	var classof = classof$1;
	var getMethod$2 = getMethod$4;
	var Iterators = iterators;
	var wellKnownSymbol$1 = wellKnownSymbol$8;

	var ITERATOR = wellKnownSymbol$1('iterator');

	var getIteratorMethod$2 = function (it) {
	  if (it != undefined) return getMethod$2(it, ITERATOR)
	    || getMethod$2(it, '@@iterator')
	    || Iterators[classof(it)];
	};

	var aCallable$2 = aCallable$5;
	var anObject$6 = anObject$b;
	var getIteratorMethod$1 = getIteratorMethod$2;

	var getIterator$1 = function (argument, usingIterator) {
	  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$1(argument) : usingIterator;
	  if (aCallable$2(iteratorMethod)) return anObject$6(iteratorMethod.call(argument));
	  throw TypeError(String(argument) + ' is not iterable');
	};

	var anObject$5 = anObject$b;
	var getMethod$1 = getMethod$4;

	var iteratorClose$2 = function (iterator, kind, value) {
	  var innerResult, innerError;
	  anObject$5(iterator);
	  try {
	    innerResult = getMethod$1(iterator, 'return');
	    if (!innerResult) {
	      if (kind === 'throw') throw value;
	      return value;
	    }
	    innerResult = innerResult.call(iterator);
	  } catch (error) {
	    innerError = true;
	    innerResult = error;
	  }
	  if (kind === 'throw') throw value;
	  if (innerError) throw innerResult;
	  anObject$5(innerResult);
	  return value;
	};

	var anObject$4 = anObject$b;
	var isArrayIteratorMethod = isArrayIteratorMethod$1;
	var lengthOfArrayLike = lengthOfArrayLike$2;
	var bind = functionBindContext;
	var getIterator = getIterator$1;
	var getIteratorMethod = getIteratorMethod$2;
	var iteratorClose$1 = iteratorClose$2;

	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate$1 = function (iterable, unboundFunction, options) {
	  var that = options && options.that;
	  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
	  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
	  var INTERRUPTED = !!(options && options.INTERRUPTED);
	  var fn = bind(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
	  var iterator, iterFn, index, length, result, next, step;

	  var stop = function (condition) {
	    if (iterator) iteratorClose$1(iterator, 'normal', condition);
	    return new Result(true, condition);
	  };

	  var callFn = function (value) {
	    if (AS_ENTRIES) {
	      anObject$4(value);
	      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
	    } return INTERRUPTED ? fn(value, stop) : fn(value);
	  };

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (!iterFn) throw TypeError(String(iterable) + ' is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
	        result = callFn(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = getIterator(iterable, iterFn);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    try {
	      result = callFn(step.value);
	    } catch (error) {
	      iteratorClose$1(iterator, 'throw', error);
	    }
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};

	// https://github.com/tc39/proposal-iterator-helpers
	var $$1 = _export;
	var iterate = iterate$1;
	var anObject$3 = anObject$b;

	$$1({ target: 'Iterator', proto: true, real: true }, {
	  forEach: function forEach(fn) {
	    iterate(anObject$3(this), fn, { IS_ITERATOR: true });
	  }
	});

	var redefine = redefine$3.exports;

	var redefineAll$1 = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);
	  return target;
	};

	var aCallable$1 = aCallable$5;
	var anObject$2 = anObject$b;
	var create = objectCreate;
	var createNonEnumerableProperty = createNonEnumerableProperty$5;
	var redefineAll = redefineAll$1;
	var wellKnownSymbol = wellKnownSymbol$8;
	var InternalStateModule = internalState;
	var getMethod = getMethod$4;
	var IteratorPrototype = iteratorsCore.IteratorPrototype;

	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.get;

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
	  var IteratorProxy = function Iterator(state) {
	    state.next = aCallable$1(state.iterator.next);
	    state.done = false;
	    state.ignoreArg = !IS_ITERATOR;
	    setInternalState(this, state);
	  };

	  IteratorProxy.prototype = redefineAll(create(IteratorPrototype), {
	    next: function next(arg) {
	      var state = getInternalState(this);
	      var args = arguments.length ? [state.ignoreArg ? undefined : arg] : IS_ITERATOR ? [] : [undefined];
	      state.ignoreArg = false;
	      var result = state.done ? undefined : nextHandler.call(state, args);
	      return { done: state.done, value: result };
	    },
	    'return': function (value) {
	      var state = getInternalState(this);
	      var iterator = state.iterator;
	      state.done = true;
	      var $$return = getMethod(iterator, 'return');
	      return { done: true, value: $$return ? anObject$2($$return.call(iterator, value)).value : value };
	    },
	    'throw': function (value) {
	      var state = getInternalState(this);
	      var iterator = state.iterator;
	      state.done = true;
	      var $$throw = getMethod(iterator, 'throw');
	      if ($$throw) return $$throw.call(iterator, value);
	      throw value;
	    }
	  });

	  if (!IS_ITERATOR) {
	    createNonEnumerableProperty(IteratorProxy.prototype, TO_STRING_TAG, 'Generator');
	  }

	  return IteratorProxy;
	};

	var anObject$1 = anObject$b;
	var iteratorClose = iteratorClose$2;

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing$1 = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject$1(value)[0], value[1]) : fn(value);
	  } catch (error) {
	    iteratorClose(iterator, 'throw', error);
	  }
	};

	// https://github.com/tc39/proposal-iterator-helpers
	var $ = _export;
	var aCallable = aCallable$5;
	var anObject = anObject$b;
	var createIteratorProxy = iteratorCreateProxy;
	var callWithSafeIterationClosing = callWithSafeIterationClosing$1;

	var IteratorProxy = createIteratorProxy(function (args) {
	  var iterator = this.iterator;
	  var result = anObject(this.next.apply(iterator, args));
	  var done = this.done = !!result.done;
	  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, result.value);
	});

	$({ target: 'Iterator', proto: true, real: true }, {
	  map: function map(mapper) {
	    return new IteratorProxy({
	      iterator: anObject(this),
	      mapper: aCallable(mapper)
	    });
	  }
	});

	const isZHInGameSetting = localStorage.getItem("i18nextLng")?.toLowerCase()?.startsWith("zh"); // 获取游戏内设置语言
	let isZH = isZHInGameSetting; // MWITools 本身显示的语言默认由游戏内设置语言决定

	let settingsMap = {
	  projectileScale: {
	    id: "projectileScale",
	    desc: isZH ? "投射物缩放" : "Projectile Scale",
	    value: 1.0,
	    min: 0.1,
	    max: 3.0,
	    step: 0.01
	  },
	  onHitScale: {
	    id: "onHitScale",
	    desc: isZH ? "命中效果缩放" : "On-hit Effect Scale",
	    value: 1.0,
	    min: 0.1,
	    max: 3.0,
	    step: 0.01
	  },
	  projectileHeightScale: {
	    id: "projectileHeightScale",
	    desc: isZH ? "弹道高度比例" : "Projectile Height Scale",
	    value: 1.0,
	    min: 0.1,
	    max: 3.0,
	    step: 0.01
	  },
	  projectileSpeedScale: {
	    id: "projectileSpeedScale",
	    desc: isZH ? "弹道速度比例" : "Projectile Speed Scale",
	    value: 1.0,
	    min: 0.1,
	    max: 3.0,
	    step: 0.01
	  },
	  shakeEffectScale: {
	    id: "shakeEffectScale",
	    desc: isZH ? "震动效果" : "Shake Effect Scale",
	    value: 1.0,
	    min: 0.0,
	    max: 3.0,
	    step: 0.01
	  },
	  particleEffectRatio: {
	    id: "particleEffectRatio",
	    desc: isZH ? "粒子效果数量" : "Particle Effect Ratio",
	    value: 1.0,
	    min: 0.0,
	    max: 5.0,
	    step: 0.1
	  },
	  particleLifespanRatio: {
	    id: "particleLifespanRatio",
	    desc: isZH ? "粒子效果持续时长" : "Particle Lifespan Ratio",
	    value: 1.0,
	    min: 0.1,
	    max: 5.0,
	    step: 0.1
	  },
	  projectileTrailLength: {
	    id: "projectileTrailLength",
	    desc: isZH ? "弹道尾迹长度" : "Projectile Trail Length",
	    value: 1.0,
	    min: 0.0,
	    max: 5.0,
	    step: 0.01
	  },
	  originalDamageDisplay: {
	    id: "originalDamageDisplay",
	    desc: isZH ? "原版伤害显示" : "Original Damage Display",
	    value: false
	  },
	  tracker0: {
	    id: "tracker0",
	    desc: isZH ? "玩家颜色 #1" : "Player Color1",
	    isTrue: true,
	    r: 255,
	    g: 99,
	    b: 132
	  },
	  tracker1: {
	    id: "tracker1",
	    desc: isZH ? "玩家颜色 #2" : "Player Color2",
	    isTrue: true,
	    r: 54,
	    g: 162,
	    b: 235
	  },
	  tracker2: {
	    id: "tracker2",
	    desc: isZH ? "玩家颜色 #3" : "Player Color3",
	    isTrue: true,
	    r: 255,
	    g: 206,
	    b: 86
	  },
	  tracker3: {
	    id: "tracker3",
	    desc: isZH ? "玩家颜色 #4" : "Player Color4",
	    isTrue: true,
	    r: 75,
	    g: 192,
	    b: 192
	  },
	  tracker4: {
	    id: "tracker4",
	    desc: isZH ? "玩家颜色 #5" : "Player Color5",
	    isTrue: true,
	    r: 153,
	    g: 102,
	    b: 255
	  },
	  tracker6: {
	    id: "tracker6",
	    desc: isZH ? "敌人颜色" : "Enemies Color",
	    isTrue: true,
	    r: 255,
	    g: 0,
	    b: 0
	  }
	};
	readSettings();
	function waitForSetttins() {
	  const targetNode = document.querySelector("div.SettingsPanel_profileTab__214Bj");
	  if (targetNode) {
	    if (!targetNode.querySelector("#tracker_settings")) {
	      targetNode.insertAdjacentHTML("beforeend", `<div id="tracker_settings"></div>`);
	      const insertElem = targetNode.querySelector("div#tracker_settings");
	      insertElem.insertAdjacentHTML("beforeend", `<div style="float: left; color: orange">${isZH ? "MWI-Hit-Tracker 设置 ：" : "MWI-Hit-Tracker Settings: "}</div></br>`);
	      for (const setting of Object.values(settingsMap)) {
	        if (setting.id.startsWith("tracker")) {
	          insertElem.insertAdjacentHTML("beforeend", `<div class="tracker-option"><input type="checkbox" id="${setting.id}" ${setting.isTrue ? "checked" : ""}></input>${setting.desc}<div class="color-preview" id="colorPreview_${setting.id}"></div></div>`);
	          const checkedBox = insertElem.querySelector("#" + setting.id);
	          checkedBox.addEventListener("change", e => {
	            settingsMap[setting.id].isTrue = e.target.checked;
	            saveSettings();
	          });
	          const colorPreview = document.getElementById('colorPreview_' + setting.id);
	          let currentColor = {
	            r: setting.r,
	            g: setting.g,
	            b: setting.b
	          };

	          // 点击打开颜色选择器
	          colorPreview.addEventListener('click', () => {
	            const settingColor = {
	              r: settingsMap[setting.id].r,
	              g: settingsMap[setting.id].g,
	              b: settingsMap[setting.id].b
	            };
	            const modal = createColorPicker(settingColor, newColor => {
	              currentColor = newColor;
	              settingsMap[setting.id].r = newColor.r;
	              settingsMap[setting.id].g = newColor.g;
	              settingsMap[setting.id].b = newColor.b;
	              localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
	              updatePreview();
	            });
	            document.body.appendChild(modal);
	          });
	          function updatePreview() {
	            colorPreview.style.backgroundColor = `rgb(${currentColor.r},${currentColor.g},${currentColor.b})`;
	          }
	          updatePreview();
	          function createColorPicker(initialColor, callback) {
	            // 创建弹窗容器
	            const backdrop = document.createElement('div');
	            backdrop.className = 'modal-backdrop';
	            const modal = document.createElement('div');
	            modal.className = 'color-picker-modal';

	            // 创建SVG容器
	            const preview = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	            preview.setAttribute("width", "200");
	            preview.setAttribute("height", "150");
	            preview.style.display = 'block';
	            // 创建抛物线路径
	            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	            Object.assign(path.style, {
	              strokeWidth: '5px',
	              fill: 'none',
	              strokeLinecap: 'round'
	            });
	            path.setAttribute("d", "M 0 130 Q 100 0 200 130");
	            preview.appendChild(path);

	            // 颜色控制组件
	            const controls = document.createElement('div');
	            ['r', 'g', 'b'].forEach(channel => {
	              const container = document.createElement('div');
	              container.className = 'slider-container';

	              // 标签
	              const label = document.createElement('label');
	              label.textContent = channel.toUpperCase() + ':';
	              label.style.color = "white";

	              // 滑块
	              const slider = document.createElement('input');
	              slider.type = 'range';
	              slider.min = 0;
	              slider.max = 255;
	              slider.value = initialColor[channel];

	              // 输入框
	              const input = document.createElement('input');
	              input.type = 'number';
	              input.min = 0;
	              input.max = 255;
	              input.value = initialColor[channel];
	              input.style.width = '60px';

	              // 双向绑定
	              const updateChannel = value => {
	                value = Math.min(255, Math.max(0, parseInt(value) || 0));
	                slider.value = value;
	                input.value = value;
	                currentColor[channel] = value;
	                path.style.stroke = getColorString(currentColor);
	              };
	              slider.addEventListener('input', e => updateChannel(e.target.value));
	              input.addEventListener('change', e => updateChannel(e.target.value));
	              container.append(label, slider, input);
	              controls.append(container);
	            });

	            // 操作按钮
	            const actions = document.createElement('div');
	            actions.className = 'modal-actions';
	            const confirmBtn = document.createElement('button');
	            confirmBtn.textContent = isZH ? '确定' : 'OK';
	            confirmBtn.onclick = () => {
	              callback(currentColor);
	              backdrop.remove();
	            };
	            const cancelBtn = document.createElement('button');
	            cancelBtn.textContent = isZH ? '取消' : 'Cancel';
	            cancelBtn.onclick = () => backdrop.remove();
	            actions.append(cancelBtn, confirmBtn);

	            // 组装弹窗
	            const getColorString = color => `rgb(${color.r},${color.g},${color.b})`;
	            path.style.stroke = getColorString(settingsMap[setting.id]);
	            modal.append(preview, controls, actions);
	            backdrop.append(modal);

	            // 点击背景关闭
	            backdrop.addEventListener('click', e => {
	              if (e.target === backdrop) backdrop.remove();
	            });
	            return backdrop;
	          }
	        } else {
	          if (typeof setting.value === "boolean") {
	            insertElem.insertAdjacentHTML("beforeend", `<div class="tracker-option">${setting.desc}<input type="checkbox" id="trackerSetting_${setting.id}"></input></div>`);
	            const checkedBox = insertElem.querySelector("#trackerSetting_" + setting.id);
	            checkedBox.checked = setting.value;
	            checkedBox.addEventListener("change", e => {
	              settingsMap[setting.id].value = e.target.checked;
	              saveSettings();
	            });
	          } else if (typeof setting.value === "number") {
	            insertElem.insertAdjacentHTML("beforeend", `<div class="tracker-option">${setting.desc}<input type="range" id="trackerSetting_${setting.id}_range"></input><input type="number" id="trackerSetting_${setting.id}_value"></input></div>`);
	            const slider = document.querySelector("#trackerSetting_" + setting.id + "_range");
	            slider.min = setting.min;
	            slider.max = setting.max;
	            slider.step = setting.step || 0.05;
	            slider.value = setting.value;
	            const input = document.querySelector("#trackerSetting_" + setting.id + "_value");
	            input.min = setting.min;
	            input.max = setting.max;
	            input.step = setting.step || 0.05;
	            input.value = setting.value;
	            const updateChannel = value => {
	              value = Math.min(setting.max, Math.max(setting.min, parseFloat(value)));
	              slider.value = value;
	              input.value = value;
	              settingsMap[setting.id].value = value;
	            };
	            slider.addEventListener('input', e => updateChannel(e.target.value));
	            input.addEventListener('change', e => updateChannel(e.target.value));
	          }
	        }
	      }
	      insertElem.addEventListener("change", saveSettings);
	    }
	  }
	  setTimeout(waitForSetttins, 500);
	}
	function saveSettings() {
	  localStorage.setItem("tracker_settingsMap", JSON.stringify(settingsMap));
	}
	function readSettings() {
	  const ls = localStorage.getItem("tracker_settingsMap");
	  if (ls) {
	    const lsObj = JSON.parse(ls);
	    for (const option of Object.values(lsObj)) {
	      if (option.id.startsWith("tracker")) {
	        if (settingsMap.hasOwnProperty(option.id)) {
	          settingsMap[option.id].isTrue = option.isTrue;
	          settingsMap[option.id].r = option.r;
	          settingsMap[option.id].g = option.g;
	          settingsMap[option.id].b = option.b;
	        }
	      } else {
	        settingsMap[option.id].value = option.value;
	      }
	    }
	  }
	}
	const style = document.createElement('style');
	style.textContent = `
    .tracker-option {
      display: flex;
      align-items: left;
      gap: 10px;
    }

    .color-preview {
        cursor: pointer;
        width: 20px;
        height: 20px;
        margin: 3px 3px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }

    .color-picker-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.5);
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
        z-index: 1000;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    }

    .modal-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
`;
	document.head.appendChild(style);

	/*
	projectEffect = {
	    speedFactor: 1,         // 速度因子
	    trailLength: 50,        // 尾迹长度
	    gravity: 0.2,           // 重力
	    shake: true,            // 是否震动
	    color: rgba(0, 0, 0, 0),    // 强制颜色
	    onHit: {                // 碰撞时的粒子效果
	        "smoke": 0, 
	    },
	    draw: (ctx, p) => {     // 绘制函数, ctx为canvas的上下文对象, p为Projectile对象

	    },
	    glow: (ctx, p) => {     // 光晕绘制函数, ctx为canvas的上下文对象, p为Projectile对象，空则不绘制

	    },
	}
	*/

	const projectileEffectsMap = {
	  'fireball': {
	    speedFactor: 1,
	    trailLength: 35,
	    shake: true,
	    onHit: {
	      "smoke": size => Math.min(Math.ceil(size * 4), 8),
	      "ember": size => Math.min(Math.ceil(size * 10), 40),
	      "shockwave": size => Math.min(Math.ceil(size), 4),
	      "smallParticle": size => Math.min(Math.ceil(size * 4), 10)
	    },
	    draw: (ctx, p) => {
	      ctx.beginPath();
	      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
	      ctx.fillStyle = p.color;
	      ctx.fill();
	    },
	    glow: (ctx, p) => {
	      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
	      gradient.addColorStop(0, `${p.color}`);
	      gradient.addColorStop(1, `${p.color}`);
	      ctx.fillStyle = gradient;
	    }
	  },
	  'nature': {
	    speedFactor: 1,
	    trailLength: 35,
	    shake: true,
	    onHit: {
	      "leaf": size => Math.min(Math.ceil(size * 8), 16)
	    },
	    draw: (ctx, p) => {
	      ctx.beginPath();
	      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
	      ctx.fillStyle = p.color;
	      ctx.fill();
	    },
	    glow: (ctx, p) => {
	      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
	      gradient.addColorStop(0, `${p.color}`);
	      gradient.addColorStop(1, `${p.color}`);
	      ctx.fillStyle = gradient;
	    }
	  },
	  'heal': {
	    trailLength: 60,
	    shake: false,
	    onHit: {
	      "holyCross": size => Math.min(Math.ceil(size * 12), 10)
	    },
	    draw: (ctx, p) => {
	      // draw a star
	      ctx.beginPath();
	      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
	      ctx.fillStyle = p.color;
	      ctx.fill();
	    }
	  },
	  'selfHeal': {
	    speedFactor: 10,
	    trailLength: 0,
	    gravity: 0,
	    shake: false,
	    color: 'rgba(0, 255, 0, 0.8)',
	    onHit: {
	      "holyCross": size => Math.min(Math.ceil(size * 12), 10)
	    },
	    draw: (ctx, p) => {}
	  },
	  'selfManaRegen': {
	    speedFactor: 10,
	    trailLength: 0,
	    gravity: 0,
	    shake: false,
	    color: 'rgba(68, 120, 241, 0.8)',
	    onHit: {
	      "holyCross": size => Math.min(Math.ceil(size * 12), 10)
	    },
	    draw: (ctx, p) => {}
	  }
	};

	const onHitEffectsMap = {
	  "smoke": {
	    angle: p => Math.random() * Math.PI * 2,
	    alpha: p => 0.7,
	    speed: p => (Math.random() * 0.2 + 0.1) * Math.sqrt(p.size),
	    size: p => (Math.random() * 20 + 10) * p.size,
	    life: p => 4000 * Math.sqrt(p.size),
	    gravity: p => -0.2 * Math.sqrt(p.size),
	    draw: (ctx, p) => {
	      if (!p.initialized) {
	        p.initialized = true;
	        p.y -= 5 * p.size;
	        p.sizeVariation = Math.random() * 0.2 + 0.9; // Size variation for billowing effect
	        p.rotationSpeed = (Math.random() - 0.5) * 0.02; // Slow rotation
	        p.rotation = Math.random() * Math.PI * 2;
	      }
	      p.speed *= 0.995; // Slower deceleration
	      p.x += Math.cos(p.angle) * p.speed;
	      p.y += Math.sin(p.angle) * p.speed + p.gravity;
	      p.life -= 1;
	      p.alpha = Math.max(0, p.alpha - 0.001);
	      p.rotation += p.rotationSpeed;
	      if (p.life > 0) {
	        ctx.save();
	        ctx.translate(p.x, p.y);
	        ctx.rotate(p.rotation);

	        // Draw main smoke puff
	        ctx.beginPath();
	        ctx.ellipse(0, 0, p.size * p.sizeVariation, p.size, 0, 0, Math.PI * 2);
	        ctx.fillStyle = `rgba(80, 80, 80, ${p.alpha * (p.life / 2000)})`;
	        ctx.fill();

	        // Add some variation to the smoke puff
	        ctx.beginPath();
	        ctx.ellipse(p.size * 0.3, -p.size * 0.2, p.size * 0.6, p.size * 0.8, 0, 0, Math.PI * 2);
	        ctx.fillStyle = `rgba(80, 80, 80, ${p.alpha * 0.7 * (p.life / 2000)})`;
	        ctx.fill();
	        ctx.restore();
	      }
	    }
	  },
	  "ember": {
	    angle: p => Math.random() * Math.PI * 2,
	    alpha: p => 1,
	    speed: p => (Math.random() * 2 + 0.5) * Math.sqrt(p.size),
	    size: p => (Math.random() * 6 + 2) * p.size,
	    life: p => 1200 * Math.sqrt(p.size),
	    gravity: p => 0.3,
	    draw: (ctx, p) => {
	      p.speed *= 0.99; // 慢慢减速
	      p.x += Math.cos(p.angle) * p.speed;
	      p.y += Math.sin(p.angle) * p.speed + p.gravity;
	      p.life -= 3;
	      if (p.life > 0) {
	        const alpha = p.life / 800;
	        ctx.beginPath();
	        ctx.arc(p.x, p.y, p.size * (p.life / 800), 0, Math.PI * 2);
	        ctx.fillStyle = `${p.color.slice(0, -4)}%, ${alpha})`;
	        ctx.fill();

	        // 余烬偶尔产生的小火花
	        if (Math.random() < 0.03) {
	          ctx.beginPath();
	          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
	          ctx.fillStyle = `hsla(30, 100%, 70%, ${alpha * 0.7})`;
	          ctx.fill();
	        }
	      }
	    }
	  },
	  "shockwave": {
	    size: p => 10 * p.size,
	    life: p => 800 * Math.sqrt(p.size),
	    draw: (ctx, p) => {
	      if (!p.maxSize) {
	        p.maxSize = p.size * (150 + Math.random() * 100) / 10;
	      }
	      p.size += (p.maxSize - p.size) * 0.1;
	      p.life -= 10;
	      if (p.life > 0) {
	        const alpha = p.life / 400;
	        ctx.beginPath();
	        ctx.strokeStyle = p.color;
	        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
	        ctx.lineWidth = 5 * alpha;
	        ctx.stroke();
	      }
	    }
	  },
	  "smallParticle": {
	    angle: p => Math.random() * Math.PI * 2,
	    size: p => (Math.random() * 12 + 8) * p.size,
	    speed: p => (Math.random() * 6 + 2) * Math.sqrt(p.size),
	    gravity: p => 0.3 + Math.random() * 0.1,
	    life: p => 400 * p.size,
	    draw: (ctx, p) => {
	      p.size = p.size * (1 - p.life / 400);
	      p.x += Math.cos(p.angle) * p.speed;
	      p.y += Math.sin(p.angle) * p.speed + p.gravity;
	      p.life -= 3;
	      if (p.life > 0) {
	        ctx.beginPath();
	        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
	        ctx.fillStyle = p.color;
	        ctx.fill();
	      }
	    }
	  },
	  "holyCross": {
	    x: p => p.x + (Math.random() - 0.5) * 60,
	    y: p => p.y + (Math.random() - 0.5) * 10,
	    size: p => (8 * Math.random() + 12) * p.size,
	    life: p => 1200 * Math.sqrt(p.size),
	    speed: p => 0,
	    gravity: p => -0.008 * Math.random() - 0.008,
	    draw: (ctx, p) => {
	      p.speed += p.gravity;
	      p.y += p.speed;
	      p.life -= 3;
	      if (p.life > 0) {
	        ctx.save();
	        ctx.translate(p.x, p.y);
	        ctx.fillStyle = p.color;
	        ctx.fillRect(-p.size / 2, -p.size * 2, p.size, p.size * 4);
	        ctx.fillRect(-p.size * 2, -p.size / 2, p.size * 4, p.size);
	        ctx.restore();
	      }
	    }
	  },
	  "leaf": {
	    // Made by HwiteCat
	    x: p => p.x + (Math.random() - 0.5) * 60,
	    y: p => p.y + (Math.random() - 0.5) * 10,
	    angle: p => Math.random() * Math.PI * 2,
	    size: p => (12 * Math.random() + 8) * p.size,
	    life: p => 1250 * p.size,
	    speed: p => (Math.random() * 3 + 1) * Math.sqrt(p.size),
	    gravity: p => 0.12,
	    draw: (ctx, p) => {
	      if (!p.rotation) p.rotation = Math.random() * Math.PI * 2;
	      if (!p.rotationSpeed) p.rotationSpeed = (Math.random() - 0.5) * 0.02;
	      if (!p.sway) p.sway = (Math.random() - 0.5) * 0.2;
	      if (!p.swaySpeed) p.swaySpeed = (Math.random() - 0.5) * 0.02;
	      p.speed *= 0.98;
	      p.x += Math.cos(p.angle) * p.speed;
	      p.y += Math.sin(p.angle) * p.speed + p.gravity;
	      p.life -= 3;
	      if (p.rotation !== undefined) {
	        p.rotation += p.rotationSpeed;
	      }
	      if (p.scale !== undefined) {
	        p.scale += p.scaleSpeed;
	        p.scale = Math.max(0.1, p.scale);
	      }
	      if (p.sway !== undefined) {
	        p.x += Math.sin(p.y * p.swaySpeed) * p.sway;
	      }
	      if (p.life > 0) {
	        ctx.save();
	        ctx.translate(p.x, p.y);
	        ctx.rotate(p.rotation);
	        ctx.scale(p.scale, 1);
	        ctx.beginPath();
	        ctx.moveTo(0, -p.size);
	        ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size / 2, 0, 0, p.size);
	        ctx.bezierCurveTo(-p.size / 2, 0, -p.size / 2, -p.size / 2, 0, -p.size);
	        ctx.fillStyle = p.color;
	        ctx.fill();
	        ctx.restore();
	      }
	    }
	  },
	  "slash": {
	    // Main slash effect
	    x: p => p.x,
	    y: p => p.y,
	    angle: p => Math.random() * Math.PI * 2,
	    size: p => 2 * p.size,
	    life: p => 250 * p.size,
	    draw: (ctx, p) => {
	      if (!p.length) p.length = p.size * (120 + Math.random() * 80); // More consistent length
	      if (!p.maxWidth) p.maxWidth = 1.5 * Math.sqrt(p.size); // Thinner slash
	      p.life -= 2; // Even slower fade

	      if (p.life > 0) {
	        const alpha = p.life / 500;
	        ctx.save();
	        ctx.translate(p.x, p.y);
	        ctx.rotate(p.angle);

	        // Draw main slash line with improved tapered shape
	        ctx.beginPath();
	        ctx.moveTo(-p.length / 2, 0);
	        ctx.quadraticCurveTo(-p.length / 4, -p.maxWidth * 0.6, -p.length / 6, -p.maxWidth);
	        ctx.lineTo(p.length / 6, -p.maxWidth);
	        ctx.quadraticCurveTo(p.length / 4, -p.maxWidth * 0.6, p.length / 2, 0);
	        ctx.quadraticCurveTo(p.length / 4, p.maxWidth * 0.6, p.length / 6, p.maxWidth);
	        ctx.lineTo(-p.length / 6, p.maxWidth);
	        ctx.quadraticCurveTo(-p.length / 4, p.maxWidth * 0.6, -p.length / 2, 0);
	        ctx.closePath();
	        ctx.fillStyle = p.color.replace('0.9', alpha.toString());
	        ctx.fill();

	        // Enhanced glow effect
	        ctx.beginPath();
	        ctx.moveTo(-p.length / 2, 0);
	        ctx.quadraticCurveTo(-p.length / 4, -p.maxWidth * 0.8, -p.length / 6, -p.maxWidth * 1.5);
	        ctx.lineTo(p.length / 6, -p.maxWidth * 1.5);
	        ctx.quadraticCurveTo(p.length / 4, -p.maxWidth * 0.8, p.length / 2, 0);
	        ctx.quadraticCurveTo(p.length / 4, p.maxWidth * 0.8, p.length / 6, p.maxWidth * 1.5);
	        ctx.lineTo(-p.length / 6, p.maxWidth * 1.5);
	        ctx.quadraticCurveTo(-p.length / 4, p.maxWidth * 0.8, -p.length / 2, 0);
	        ctx.closePath();
	        ctx.fillStyle = p.color.replace('0.9', (alpha * 0.3).toString());
	        ctx.fill();
	        ctx.restore();
	      }
	    }
	  },
	  "slashParticle": {
	    // Enhanced particle effect for slash
	    x: p => p.x + (Math.random() - 0.5) * 15,
	    // Tighter initial spread
	    y: p => p.y + (Math.random() - 0.5) * 15,
	    angle: p => {
	      const baseAngle = p.parentAngle || Math.random() * Math.PI * 2;
	      return baseAngle + (Math.random() - 0.5) * 0.1; // Very small variation
	    },
	    size: p => (2 * Math.random() + 2) * p.size,
	    // Bigger particles
	    life: p => 600 * p.size,
	    // Adjusted for faster movement
	    speed: p => (Math.random() * 1 + 3) * Math.sqrt(p.size),
	    // Much faster speed
	    gravity: p => 0.02,
	    // Minimal gravity for more directional movement
	    draw: (ctx, p) => {
	      p.speed *= 0.998; // Very smooth deceleration
	      p.x += Math.cos(p.angle) * p.speed;
	      p.y += Math.sin(p.angle) * p.speed + p.gravity;
	      p.life -= 3;
	      if (p.life > 0) {
	        const alpha = p.life / 400;
	        ctx.save();
	        ctx.translate(p.x, p.y);
	        ctx.rotate(p.angle);

	        // Draw particle with more elongation in movement direction
	        ctx.beginPath();
	        ctx.moveTo(-p.size / 2, 0);
	        ctx.quadraticCurveTo(-p.size / 4, -p.size / 2, 0, -p.size * 1.2);
	        ctx.quadraticCurveTo(p.size / 4, -p.size / 2, p.size / 2, 0);
	        ctx.quadraticCurveTo(p.size / 4, p.size / 2, 0, p.size * 1.2);
	        ctx.quadraticCurveTo(-p.size / 4, p.size / 2, -p.size / 2, 0);
	        ctx.closePath();
	        ctx.fillStyle = p.color.replace('0.9', alpha.toString());
	        ctx.fill();

	        // Add small glow to particles
	        ctx.beginPath();
	        ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
	        ctx.fillStyle = p.color.replace('0.9', (alpha * 0.3).toString());
	        ctx.fill();
	        ctx.restore();
	      }
	    }
	  },
	  "waterRipple": {
	    x: p => p.x,
	    y: p => p.y,
	    size: p => 7 * p.size,
	    life: p => 1200 * p.size,
	    draw: (ctx, p) => {
	      if (!p.ripples) {
	        p.ripples = [{
	          radius: 0,
	          opacity: 0.5,
	          width: 3,
	          speed: 0.7
	        },
	        // Fast, bright inner ripple
	        {
	          radius: 0,
	          opacity: 0.5,
	          width: 2,
	          speed: 0.5
	        },
	        // Medium ripple
	        {
	          radius: 0,
	          opacity: 0.5,
	          width: 1.5,
	          speed: 0.3
	        } // Slow, faint outer ripple
	        ];
	      }
	      p.life -= 1;

	      // Update each ripple
	      p.ripples.forEach((ripple, index) => {
	        // Expand the ripple
	        ripple.radius += ripple.speed;

	        // Calculate opacity based on radius
	        const maxRadius = 30 * p.size;
	        const fadeStart = maxRadius * 0.6;
	        if (ripple.radius > fadeStart) {
	          ripple.opacity *= 0.98; // Gradual fade out
	        }

	        // Draw the ripple if it's still visible
	        if (ripple.opacity > 0.05 && ripple.radius < maxRadius) {
	          ctx.beginPath();
	          ctx.strokeStyle = p.color.replace('0.8', ripple.opacity.toString());
	          ctx.lineWidth = ripple.width * (1 - ripple.radius / maxRadius);
	          ctx.arc(p.x, p.y, ripple.radius, 0, Math.PI * 2);
	          ctx.stroke();

	          // Add a second, fainter ring for more water-like effect
	          if (ripple.radius > 5) {
	            ctx.beginPath();
	            ctx.strokeStyle = p.color.replace('0.8', (ripple.opacity * 0.5).toString());
	            ctx.lineWidth = ripple.width * 0.5 * (1 - ripple.radius / maxRadius);
	            ctx.arc(p.x, p.y, ripple.radius - 2, 0, Math.PI * 2);
	            ctx.stroke();
	          }
	        }
	      });
	    }
	  },
	  "waterSplash": {
	    x: p => p.x,
	    y: p => p.y,
	    size: p => (2 * Math.random() + 5) * p.size,
	    // Smaller size
	    life: p => 800 * p.size,
	    draw: (ctx, p) => {
	      if (!p.initialized) {
	        p.initialized = true;
	        p.particles = [];
	        // Create particles in a circular pattern
	        const particleCount = 7; // More particles for better coverage
	        for (let i = 0; i < particleCount; i++) {
	          const angle = i / particleCount * Math.PI * 2;
	          // Add some random variation to the angle
	          const angleVariation = (Math.random() - 0.5) * 0.5;
	          const finalAngle = angle + angleVariation;

	          // Create size variation with smaller base size
	          const sizeVariation = Math.random() * 1.5 + 0.5; // Random multiplier between 0.5 and 2
	          const baseSize = (Math.random() * 0.8 + 0.4) * p.size; // Reduced base size

	          p.particles.push({
	            x: p.x,
	            y: p.y,
	            angle: finalAngle,
	            speed: (Math.random() * 1.5 + 1) * Math.sqrt(p.size),
	            size: baseSize * sizeVariation,
	            initialSize: baseSize * sizeVariation,
	            life: 800 * p.size,
	            gravity: 0.9 + (Math.random() * 0.2 - 0.1) // Slight gravity variation
	          });
	        }
	      }
	      p.life -= 2;

	      // Update and draw particles
	      p.particles.forEach(particle => {
	        particle.speed *= 0.98; // Deceleration
	        particle.x += Math.cos(particle.angle) * particle.speed;
	        particle.y += Math.sin(particle.angle) * particle.speed + particle.gravity;
	        particle.life -= 2;
	        const lifeRatio = particle.life / (800 * p.size);
	        const opacity = lifeRatio * 0.6; // More transparent
	        // More dramatic shrinking with cubic easing
	        particle.size = particle.initialSize * Math.pow(lifeRatio, 3);
	        if (particle.life > 0) {
	          ctx.beginPath();
	          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
	          ctx.fillStyle = p.color.replace('0.8', opacity.toString());
	          ctx.fill();
	        }
	      });
	    }
	  }
	};

	const canvas = initTrackerCanvas();
	const ctx = canvas.getContext('2d');
	function initTrackerCanvas() {
	  const gamePanel = document.querySelector("body");
	  const canvas = document.createElement('canvas');
	  canvas.id = 'hitTrackerCanvas';
	  canvas.style.position = 'fixed';
	  canvas.style.top = '0';
	  canvas.style.left = '0';
	  canvas.style.pointerEvents = 'none';
	  canvas.style.zIndex = '200';
	  canvas.style.width = '100%';
	  canvas.style.height = '100%';
	  canvas.width = window.innerWidth;
	  canvas.height = window.innerHeight;
	  canvas.pointerEvents = 'none';
	  gamePanel.appendChild(canvas);
	  window.addEventListener('resize', () => {
	    canvas.width = window.innerWidth;
	    canvas.height = window.innerHeight;
	  });
	  return canvas;
	}

	// Update shake animation effect to ensure element returns to original position
	function applyShakeEffect(element, intensity = 1, duration = 500) {
	  if (!element) return;

	  // Store the element's original position/transform
	  const originalTransform = element.style.transform || '';
	  const originalTransition = element.style.transition || '';
	  intensity *= settingsMap.shakeEffectScale.value || 1;

	  // Scale intensity based on size/damage
	  const scaledIntensity = Math.min(10, intensity);

	  // Apply CSS animation
	  element.style.transition = 'transform 50ms ease-in-out';
	  let shakeCount = 0;
	  const maxShakes = Math.ceil(intensity);
	  const shakeInterval = 50;
	  const interval = setInterval(() => {
	    if (shakeCount >= maxShakes) {
	      // Ensure element returns to original position
	      clearInterval(interval);
	      element.style.transform = originalTransform;
	      element.style.transition = originalTransition;
	      return;
	    }

	    // Random offset for shaking effect
	    const xOffset = (Math.random() - 0.5) * 2 * scaledIntensity;
	    const yOffset = (Math.random() - 0.5) * 2 * scaledIntensity;
	    element.style.transform = `${originalTransform} translate(${xOffset}px, ${yOffset}px)`;
	    shakeCount++;
	  }, shakeInterval);

	  // Additional safeguard: ensure element returns to original position after max duration
	  setTimeout(() => {
	    clearInterval(interval);
	    element.style.transform = 'translate(0, 0)';
	    element.style.transition = originalTransition;
	  }, shakeInterval * (maxShakes + 1)); // Slightly longer than maxShakes * interval time
	}
	function addDamageHPBar(element, damage) {
	  const hpBarContainer = element.querySelector(".HitpointsBar_hitpointsBar__2vIqC");
	  const hpBarFront = hpBarContainer.querySelector(".HitpointsBar_currentHp__5exLr");
	  // hpBarFront.style.zIndex = "1";
	  const hpBarValue = hpBarContainer.querySelector(".HitpointsBar_hpValue__xNp7m");
	  // hpBarValue.style.zIndex = "2";
	  const hpStat = hpBarValue.innerHTML.split("/");
	  const currentHp = parseInt(hpStat[0]);
	  const maxHp = parseInt(hpStat[1]);

	  // Insert a HpBar behind and set the color to red
	  const hpBarBack = document.createElement("div");
	  hpBarBack.className = "HitpointsBar_currentHp__5exLr HitTracker_hpDrop";
	  hpBarBack.style.background = "var(--color-warning)";
	  hpBarBack.style.position = "absolute";
	  hpBarBack.style.top = "0px";
	  hpBarBack.style.left = "0px";
	  // hpBarBack.style.zIndex = "1"; // Ensure the back bar is below the front bar
	  hpBarBack.style.width = `${hpBarFront.offsetWidth}px`;
	  hpBarBack.style.height = `${hpBarFront.offsetHeight}px`;
	  hpBarBack.style.transformOrigin = "left center";
	  hpBarBack.style.transform = `scaleX(${(currentHp + damage) / maxHp})`;
	  // add animation to drop down
	  hpBarBack.style.transition = "transform 0.5s ease-in-out";
	  hpBarFront.parentNode.insertBefore(hpBarBack, hpBarFront); // Insert the back bar before the front bar

	  setTimeout(() => {
	    hpBarBack.style.transform = `scaleX(0)`;
	  }, 200);
	  setTimeout(() => {
	    hpBarBack.remove();
	  }, 800);
	}

	// 更新和渲染所有命中效果
	function updateOnHits() {
	  // 遍历所有活跃的命中
	  for (let i = activeOnHitAnimation.length - 1; i >= 0; i--) {
	    const effect = activeOnHitAnimation[i];
	    effect.count++;
	    if (effect.count >= effect.maxCount) {
	      activeOnHitAnimation.splice(i, 1);
	      continue;
	    }
	    ctx.save();

	    // 更新各自效果
	    effect.effects.forEach((e, index) => {
	      e.draw(ctx, e);
	    });

	    // 伤害文本
	    if (effect.otherInfo.damage) {
	      const fontSize = Math.min(Math.max(14, Math.pow(effect.otherInfo.damage, 0.65) / 2), 70);
	      const damageText = `${effect.otherInfo.damage}`;
	      ctx.font = `${fontSize}px Arial`;
	      ctx.textAlign = 'center';
	      ctx.textBaseline = 'middle';
	      // border
	      ctx.strokeStyle = effect.color;
	      ctx.lineWidth = 6;
	      ctx.strokeText(damageText, effect.otherInfo.end.x, effect.otherInfo.end.y - 20);
	      // main
	      ctx.fillStyle = 'white';
	      const textWidth = ctx.measureText(damageText).width;
	      if (textWidth < 100) {
	        ctx.fillText(damageText, effect.otherInfo.end.x, effect.otherInfo.end.y - 20);
	      } else {
	        ctx.fillText(damageText, effect.otherInfo.end.x, effect.otherInfo.end.y - 20, textWidth + 10);
	      }
	    }
	    ctx.restore();
	  }
	}
	let fpsStatTime = new Date().getTime();
	let fpsQueue = [];
	let fps = 60;

	// 动画循环
	function animate() {
	  // 计算FPS
	  const now = Date.now();
	  const delta = now - fpsStatTime;
	  fpsStatTime = now;
	  const fpsNow = Math.round(1000 / delta);
	  fpsQueue.push(fpsNow);
	  if (fpsQueue.length > 30) {
	    fpsQueue.shift();
	  }
	  fps = Math.round(fpsQueue.reduce((a, b) => a + b) / fpsQueue.length);

	  // 完全清空画布
	  ctx.clearRect(0, 0, canvas.width, canvas.height);

	  // 更新并绘制所有弹丸
	  for (let i = projectiles.length - 1; i >= 0; i--) {
	    const proj = projectiles[i];
	    proj.update();
	    proj.draw(ctx);
	    if (proj.isArrived()) {
	      createOnHitEffect(proj); // 将弹丸大小传递给爆炸效果
	      projectiles.splice(i, 1);
	    } else if (proj.isOutOfBounds()) {
	      // 超出边界则移除弹丸，不产生爆炸效果
	      projectiles.splice(i, 1);
	    }
	  }

	  // 更新和渲染所有爆炸效果
	  updateOnHits();
	  requestAnimationFrame(animate);
	}
	class Projectile {
	  constructor(startX, startY, endX, endY, color, initialSpeed = 1, size = 10, otherInfo = {}) {
	    // 基础属性
	    this.x = startX;
	    this.y = startY;
	    this.start = {
	      x: startX,
	      y: startY
	    };
	    this.target = {
	      x: endX,
	      y: endY
	    };
	    this.otherInfo = otherInfo;
	    this.shakeApplied = false;
	    this.type = otherInfo.type || 'default';
	    this.effect = projectileEffectsMap[this.type] || projectileEffectsMap['fireball'];
	    this.doShake = this.effect.shake;

	    // 运动参数 - 向斜上方抛物线轨迹
	    this.gravity = this.effect.gravity || 0.2; // 重力加速度
	    this.gravity *= settingsMap.projectileHeightScale.value || 1; // 高度缩放因子

	    this.initialSpeed = initialSpeed * (this.effect.speedFactor || 1); // 初始速度参数
	    this.initialSpeed *= settingsMap.projectileSpeedScale.value || 1; // 速度缩放因子

	    // 计算水平距离和高度差
	    const dx = endX - startX;
	    const dy = endY - startY;

	    // 重新设计飞行时间计算，确保合理
	    // const timeInAir = distance / this.initialSpeed / 10;
	    let timeInAir = 80 / this.initialSpeed;

	    // FPS因子，确保在不同FPS下效果一致
	    const fpsFactor = Math.min(Math.max(160 / fps, 0.125), 8);
	    this.gravity *= fpsFactor;
	    timeInAir /= fpsFactor;

	    // 计算初始速度，修正公式确保能够到达目标
	    this.velocity = {
	      x: dx / timeInAir,
	      y: dy / timeInAir - this.gravity * timeInAir / 2
	    };

	    // 大小参数 (范围1-100)
	    this.sizeScale = Math.max(1, Math.min(100, size)) / 10; // 转换为比例因子

	    // 外观属性
	    this.size = 10 * this.sizeScale;
	    this.color = this.effect.color || color;

	    // 拖尾效果
	    this.trail = [];
	    this.maxTrailLength = Math.floor((this.effect.trailLength || 50) * Math.sqrt(this.sizeScale)); // 拖尾长度随大小增加
	    this.maxTrailLength *= settingsMap.projectileTrailLength.value || 1; // 拖尾缩放因子
	  }
	  update() {
	    // 更新速度 (考虑重力)
	    this.velocity.y += this.gravity;

	    // 更新位置
	    this.x += this.velocity.x;
	    this.y += this.velocity.y;

	    // 更新拖尾
	    this.trail.push({
	      x: this.x,
	      y: this.y
	    });
	    if (this.trail.length > this.maxTrailLength) {
	      this.trail.shift();
	    }
	  }
	  draw(canvas) {
	    // 绘制拖尾
	    this.trail.forEach((pos, index) => {
	      const alpha = index / this.trail.length;
	      canvas.beginPath();
	      canvas.arc(pos.x, pos.y, this.size * alpha, 0, Math.PI * 2);
	      canvas.fillStyle = `${this.color}`;
	      canvas.fill();
	    });

	    // 绘制主体
	    this.effect.draw(canvas, this);

	    // 添加光晕效果
	    if (this.effect.glow) {
	      this.effect.glow(canvas, this);
	    }
	  }
	  isArrived() {
	    // 判断是否到达目标点 (调整判定距离)
	    const arrivalDistance = 20;
	    const hasArrived = Math.hypot(this.x - this.target.x, this.y - this.target.y) < arrivalDistance;
	    if (hasArrived && this.doShake && !this.shakeApplied && this.otherInfo.endElement) {
	      const shakeIntensity = Math.min(this.sizeScale * 5, 10);
	      applyShakeEffect(this.otherInfo.endElement, shakeIntensity);
	      this.shakeApplied = true;
	    }
	    return hasArrived;
	  }
	  isOutOfBounds() {
	    return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
	  }
	}

	// Projectiles管理
	let projectiles = [];

	// 存储所有活跃的爆炸效果
	let activeOnHitAnimation = [];

	// 爆炸效果函数
	function createOnHitEffect(projectile) {
	  const x = projectile.x;
	  const y = projectile.y;
	  const size = projectile.size;
	  const color = projectile.color;
	  const otherInfo = projectile.otherInfo;

	  // Resize for onHit effect
	  const sizeScale = Math.max(1, Math.min(100, size)) / 20;
	  projectile.size = sizeScale;
	  const sizeFactor = settingsMap.onHitScale.value || 1;
	  const particleFactor = settingsMap.particleEffectRatio.value || 1;
	  const particleLifespanFactor = settingsMap.particleLifespanRatio.value || 1;
	  const effects = [];
	  const onHitEffect = projectile.effect.onHit;
	  for (const effectName in onHitEffect) {
	    const effect = onHitEffectsMap[effectName];
	    if (!effect) continue;
	    const effectCount = Math.ceil(onHitEffect[effectName](projectile.size) * particleFactor);
	    for (let i = 0; i < effectCount; i++) {
	      const effectSize = (effect.size ? effect.size(projectile) : Math.random() * 10 + 5) * sizeFactor;
	      const effectLife = (effect.life ? effect.life(projectile) : 1000) * particleLifespanFactor;
	      effects.push({
	        x: effect.x ? effect.x(projectile) : x,
	        y: effect.y ? effect.y(projectile) : y,
	        angle: effect.angle ? effect.angle(projectile) : Math.random() * Math.PI * 2,
	        alpha: effect.alpha ? effect.alpha(projectile) : 0.8,
	        size: effectSize,
	        speed: effect.speed ? effect.speed(projectile) : Math.random() * 5 + 2,
	        gravity: effect.gravity ? effect.gravity(projectile) : 0,
	        life: effectLife,
	        color: effect.color ? effect.color(projectile) : projectile.color,
	        draw: effect.draw ? effect.draw : (ctx, p) => {}
	      });
	    }
	  }

	  // 存储命中动画的活跃状态，用于跟踪
	  const onHitEffectData = {
	    effects: [...effects],
	    active: true,
	    count: 0,
	    maxCount: 120,
	    color: color,
	    otherInfo: otherInfo
	  };
	  activeOnHitAnimation.push(onHitEffectData);
	}
	function createProjectile(startElement, endElement, color, initialSpeed = 1, damage = 200, projectileType = 'default') {
	  if (!startElement || !endElement) {
	    return;
	  }
	  const combatUnitContainer = endElement.querySelector(".CombatUnit_splatsContainer__2xcc0");
	  if (!settingsMap.originalDamageDisplay.value) {
	    combatUnitContainer.style.visibility = "hidden";
	  }
	  const padding = 30;
	  const randomRange = {
	    x: Math.floor((Math.random() - 0.5) * (combatUnitContainer.offsetWidth - 2 * padding)),
	    y: Math.floor((Math.random() - 0.1) * (combatUnitContainer.offsetHeight - padding))
	  };
	  const projectileLimit = 30;
	  const start = getElementCenter(startElement);
	  const end = getElementCenter(endElement);
	  end.x = Math.floor(end.x + randomRange.x);
	  end.y = Math.floor(end.y + randomRange.y);
	  const size = Math.min(Math.max(Math.pow(damage + 200, 0.7) / 20, 4), 16);
	  const otherInfo = {
	    type: projectileType,
	    start: start,
	    end: end,
	    damage: damage,
	    color: color,
	    startElement: startElement,
	    endElement: endElement
	  };
	  if (damage > 0) {
	    addDamageHPBar(endElement, damage);
	  }
	  const projectile = new Projectile(start.x, start.y, end.x, end.y, color, initialSpeed, size, otherInfo);
	  projectiles.push(projectile);
	  if (projectiles.length > projectileLimit) {
	    projectiles.shift();
	  }
	}
	function getElementCenter(element) {
	  const rect = element.getBoundingClientRect();
	  if (element.innerText.trim() === '') {
	    return {
	      x: rect.left + rect.width / 2,
	      y: rect.top
	    };
	  }
	  return {
	    x: rect.left + rect.width / 2,
	    y: rect.top + rect.height / 2
	  };
	}

	// #region Setting
	waitForSetttins();
	hookWS();

	// #region Hook WS
	function hookWS() {
	  const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
	  const oriGet = dataProperty.get;
	  dataProperty.get = hookedGet;
	  Object.defineProperty(MessageEvent.prototype, "data", dataProperty);
	  function hookedGet() {
	    const socket = this.currentTarget;
	    if (!(socket instanceof WebSocket)) {
	      return oriGet.call(this);
	    }
	    if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
	      return oriGet.call(this);
	    }
	    const message = oriGet.call(this);
	    Object.defineProperty(this, "data", {
	      value: message
	    }); // Anti-loop

	    return handleMessage(message);
	  }
	}
	let monstersHP = [];
	let monstersMP = [];
	let playersHP = [];
	let playersMP = [];
	let playersAbility = [];
	function handleMessage(message) {
	  let obj = JSON.parse(message);
	  if (obj && obj.type === "new_battle") {
	    monstersHP = obj.monsters.map(monster => monster.currentHitpoints);
	    monstersMP = obj.monsters.map(monster => monster.currentManapoints);
	    playersHP = obj.players.map(player => player.currentHitpoints);
	    playersMP = obj.players.map(player => player.currentManapoints);
	  } else if (obj && obj.type === "battle_updated" && monstersHP.length) {
	    const mMap = obj.mMap;
	    const pMap = obj.pMap;
	    const monsterIndices = Object.keys(obj.mMap);
	    const playerIndices = Object.keys(obj.pMap);
	    let castMonster = -1;
	    monsterIndices.forEach(monsterIndex => {
	      if (mMap[monsterIndex].cMP < monstersMP[monsterIndex]) {
	        castMonster = monsterIndex;
	      }
	      monstersMP[monsterIndex] = mMap[monsterIndex].cMP;
	    });
	    let castPlayer = -1;
	    playerIndices.forEach(userIndex => {
	      if (pMap[userIndex].cMP < playersMP[userIndex]) {
	        castPlayer = userIndex;
	      }
	      playersMP[userIndex] = pMap[userIndex].cMP;
	      if (pMap[userIndex].abilityHrid) {
	        playersAbility[userIndex] = pMap[userIndex].abilityHrid;
	      }
	    });
	    monstersHP.forEach((mHP, mIndex) => {
	      const monster = mMap[mIndex];
	      if (monster) {
	        const hpDiff = mHP - monster.cHP;
	        monstersHP[mIndex] = monster.cHP;
	        if (hpDiff > 0 && playerIndices.length > 0) {
	          if (playerIndices.length > 1) {
	            playerIndices.forEach(userIndex => {
	              if (userIndex === castPlayer) {
	                registProjectile(userIndex, mIndex, hpDiff, false, playersAbility[userIndex]);
	              }
	            });
	          } else {
	            registProjectile(playerIndices[0], mIndex, hpDiff, false, playersAbility[playerIndices[0]]);
	          }
	        }
	      }
	    });
	    playersHP.forEach((pHP, pIndex) => {
	      const player = pMap[pIndex];
	      if (player) {
	        const hpDiff = pHP - player.cHP;
	        playersHP[pIndex] = player.cHP;
	        if (hpDiff > 0 && monsterIndices.length > 0) {
	          if (monsterIndices.length > 1) {
	            monsterIndices.forEach(monsterIndex => {
	              if (monsterIndex === castMonster) {
	                registProjectile(pIndex, monsterIndex, hpDiff, true);
	              }
	            });
	          } else {
	            registProjectile(pIndex, monsterIndices[0], hpDiff, true);
	          }
	        } else if (hpDiff < 0) {
	          if (castPlayer > -1) {
	            registProjectile(castPlayer, pIndex, -hpDiff, false, 'heal', true);
	          }
	        }
	      }
	    });
	  } else if (obj && obj.type === "battle_updated") {
	    const pMap = obj.pMap;
	    const playerIndices = Object.keys(obj.pMap);
	    playerIndices.forEach(userIndex => {
	      if (pMap[userIndex].abilityHrid) {
	        playersAbility[userIndex] = pMap[userIndex].abilityHrid;
	      }
	    });
	  }
	  return message;
	}

	// #region Main Logic

	// 动画效果
	function registProjectile(from, to, hpDiff, reversed = false, abilityHrid = 'default', toPlayer = false) {
	  if (reversed) {
	    if (!settingsMap.tracker6.isTrue) {
	      return null;
	    }
	  } else {
	    if (!settingsMap["tracker" + from].isTrue) {
	      return null;
	    }
	  }
	  const container = document.querySelector(".BattlePanel_playersArea__vvwlB");
	  if (container && container.children.length > 0) {
	    const playersContainer = container.children[0];
	    const effectFrom = playersContainer.children[from];
	    const monsterContainer = document.querySelector(".BattlePanel_monstersArea__2dzrY").children[0];
	    const effectTo = toPlayer ? playersContainer.children[to] : monsterContainer.children[to];
	    const trackerSetting = reversed ? settingsMap[`tracker6`] : settingsMap["tracker" + from];
	    let lineColor = "rgba(" + trackerSetting.r + ", " + trackerSetting.g + ", " + trackerSetting.b + ", 1)";
	    // console.log(`registProjectile: ${abilityHrid} ${hpDiff}`);
	    if (abilityHrid === 'heal') {
	      lineColor = "rgba(93, 212, 93, 0.8)";
	    }
	    if (!reversed) {
	      createProjectile(effectFrom, effectTo, lineColor, 1, hpDiff, abilityHrid);
	    } else {
	      createProjectile(effectTo, effectFrom, lineColor, 1, hpDiff, abilityHrid);
	    }
	  }
	}

	// 启动动画
	animate();

})();
