/*
 * Copyright 2017 Blue Circle Software, LLC
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

import * as $ from "jquery";
import {com, jsonInterfaceGenerator} from "../../../target/generated-sources/springToTypeScript";
import JsonOptions = jsonInterfaceGenerator.JsonOptions;
import integration = com.bluecirclesoft.open.jigen.integrationSpring;

declare const __karma__: any;

jsonInterfaceGenerator.callAjax = (url: string, method: string, data: any, isBodyParam: boolean, options: JsonOptions<any>) => {
    let error = false;
    const settings: JQueryAjaxSettings = {
        async: options.hasOwnProperty("async") ? options.async : true,
        data,
        method,
    };
    if (options.success) {
        const fn = options.success;
        settings.success = (responseData: any, textStatus: string, jqXHR: JQueryXHR) => {
            fn(responseData);
        };
    }
    if (options.error) {
        const fn = options.error;
        settings.error = (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
            console.error("Error!");
            console.error("jqXHR: ", jqXHR.status);
            console.error("textStatus: ", textStatus);
            error = true;
            fn(errorThrown);
        };
    }
    if (options.complete) {
        const fn = options.complete;
        settings.complete = (jqXHR: JQueryXHR, textStatus: string) => {
            fn(!error);
        };
    }
    if (isBodyParam) {
        settings.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
        };
    }
    settings.dataType = "json";
    const actualUrl = jsonInterfaceGenerator.applyPrefix(url);
    console.log("Converted " + url + " to " + actualUrl);
    $.ajax(actualUrl, settings);
};

(window as any).$ = $;
(window as any).jQuery = $;

// pull base URL from command line
jsonInterfaceGenerator.init(__karma__.config.baseUrl);

describe("test @JsonProperty on enums", () => {
    it("has correct enum names", () => {
        let val: integration.testPackage2.EnumB = integration.testPackage2.EnumB.NUMBER_ONE;
        expect(val === integration.testPackage2.EnumB.NUMBER_ONE).toBeTruthy();
        expect(val === integration.testPackage2.EnumB_values.NumeroUno).toBeTruthy();
        expect(val === integration.testPackage2.EnumB_values[0]).toBeTruthy();
        val = integration.testPackage2.EnumB.NUMBER_TWO;
        expect(val === integration.testPackage2.EnumB.NUMBER_TWO).toBeTruthy();
        expect(val === integration.testPackage2.EnumB_values.NumeroDos).toBeTruthy();
        expect(val === integration.testPackage2.EnumB_values[2]).toBeTruthy();
        val = integration.testPackage2.EnumB.NUMBER_THREE;
        expect(val === integration.testPackage2.EnumB.NUMBER_THREE).toBeTruthy();
        expect(val === integration.testPackage2.EnumB_values.NumeroTres).toBeTruthy();
        expect(val === integration.testPackage2.EnumB_values[1]).toBeTruthy();
    });
});

describe("test TestServicesString", () => {

    // Standard handler
    function simpleHandler<T>(handler: (x: T) => void): JsonOptions<T> {
        return {
            async: false,
            complete: () => {
                console.log("complete");
            },
            error: (errorThrown: string) => {
                console.log("errorThrown=", errorThrown);
            },
            success: (s: T) => {
                console.log("success: result ", s);
                handler(s);
            },
        };
    }

    it("can execute doubleUpGetQ", () => {
        let result: string = "";
        integration.TestServicesString.doubleUpGetQ("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list[0] : "";
        }));
        expect(result).toEqual("abcabc");
    });

    it("can execute doubleUpGetP", () => {
        let result: string = "";
        integration.TestServicesString.doubleUpGetP("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list[0] : "";
        }));
        expect(result).toEqual("abcabc");
    });

    // TODO figure out how to get JQuery to pass query params when doing POST
    // it("can execute doubleUpPostQ", () => {
    //     let result: string = "";
    //     integration.TestServicesString.doubleUpPostQ("abc", simpleHandler((s: string) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual("abcabc");
    // });

    it("can execute doubleUpPostP", () => {
        let result: string = "";
        integration.TestServicesString.doubleUpPostP("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list[0] : "";
        }));
        expect(result).toEqual("abcabc");
    });

    it("can execute doubleUpPostF", () => {
        let result: string = "";
        integration.TestServicesString.doubleUpPostF("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list[0] : "";
        }));
        expect(result).toEqual("abcabc");
    });

    it("can execute doubleArrGetQ", () => {
        let result: string[] = [];
        integration.TestServicesString.doubleArrGetQ("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list : [];
        }));
        expect(result).toEqual(["abc", "abc", "abc"]);
    });

    it("can execute doubleUpGetP", () => {
        let result: string[] = [];
        integration.TestServicesString.doubleArrGetP("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list : [];
        }));
        expect(result).toEqual(["abc", "abc", "abc"]);
    });

    // TODO figure out how to get JQuery to pass query params when doing POST
    // it("can execute doubleUpPostQ", () => {
    //     let result: string[] = [];
    //     integration.TestServicesString.doubleArrPostQ("abc", simpleHandler((s: string[]) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual(["abc", "abc", "abc"]);
    // });

    it("can execute doubleUpPostP", () => {
        let result: string[] = [];
        integration.TestServicesString.doubleArrPostP("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list : [];
        }));
        expect(result).toEqual(["abc", "abc", "abc"]);
    });

    it("can execute doubleUpPostF", () => {
        let result: string[] = [];
        integration.TestServicesString.doubleArrPostF("abc", simpleHandler((s: integration.MyStringList) => {
            result = s.list ? s.list : [];
        }));
        expect(result).toEqual(["abc", "abc", "abc"]);
    });
});

describe("test TestServicesObject", () => {

    // Standard handler
    function simpleHandler<T>(handler: (x: T) => void): JsonOptions<T> {
        return {
            async: false,
            complete: () => {
                console.log("complete");
            },
            error: (errorThrown: string) => {
                console.log("errorThrown=", errorThrown);
            },
            success: (s: T) => {
                console.log("success: result ", s);
                handler(s);
            },
        };
    }

    it("can execute doubleUpBody", () => {
        console.log("URL: " + jsonInterfaceGenerator.applyPrefix("/testServicesObject/doubleUpBody"));

        let result: integration.JsonResponse = {doubleA: null, doubleB: null, doubleBoth: null};
        const arg0 = {
            a: "one",
            b: "two",
        };
        console.log("Data: " + JSON.stringify(arg0));
        integration.TestServicesObject.doubleUpBody(arg0, simpleHandler((s: integration.JsonResponse) => {
            result = s;
        }));
        expect(result).toEqual({doubleA: "oneone", doubleB: "twotwo", doubleBoth: "onetwoonetwo"});
    });

    it("can execute doubleUpNested", () => {
        console.log("URL: " + jsonInterfaceGenerator.applyPrefix("/testServicesObject/doubleUpNested"));

        let result: integration.NestedOuter | undefined;
        const arg0: integration.NestedOuter = {
            a: {a: "ab", b: "cd", c: 1, d: 2, e: [1, 2, 3]},
            b: {a: "ab", b: "cd", c: 1, d: 2, e: [1, 2, 3]},
            c: 12,
            d: "qwerty",
        };
        console.log("Data: " + JSON.stringify(arg0));
        integration.TestServicesObject.doubleUpNested(arg0, simpleHandler((s: integration.NestedOuter) => {
            result = s;
        }));
        expect(result).toEqual({...arg0, c: 24, d: "qwertyqwerty"});
    });

    it("can execute getClassB", () => {
        console.log("URL: " + jsonInterfaceGenerator.applyPrefix("/testServicesObject/getClassB"));

        let result: integration.testPackage2.ClassB | undefined;
        integration.TestServicesObject.getClassB(simpleHandler((s: integration.testPackage2.ClassB) => {
            result = s;
        }));
    });

    it("can use immutables", () => {
        const base: integration.NestedOuter = {
            a: {a: "ab", b: "cd", c: 1, d: 2, e: [1, 2, 3]},
            b: {a: "ef", b: "gh", c: 3, d: 4, e: [4, 5, 6]},
            c: 12,
            d: "qwerty",
        };

        const root = new jsonInterfaceGenerator.ChangeRoot<integration.NestedOuter>(base);
        const imm = new integration.NestedOuter$Imm(root);
        expect(imm.d).toEqual("qwerty");
        const b = imm.b;
        expect(b.b).toEqual("gh");
        const ver1 = root.getCurrent();
        b.b = "ij";
        expect(b.b).toEqual("ij");
        const ver2 = root.getCurrent();
        expect(root.getHistorySize()).toEqual(2);
        expect(ver1 === ver2).toBeFalsy("version not updated");
        expect(root.getHistory(0)).toEqual(ver1);
        expect(root.getHistory(1)).toEqual(ver2);

        const eAcc = b.e;
        expect(eAcc.get(1)).toEqual(5);
        eAcc.set(1, 23);
        expect(root.getHistorySize()).toEqual(3);
        expect(eAcc.get(1)).toEqual(23);

        imm.d = null;
        expect(root.getHistorySize()).toEqual(4);
        expect(imm.d).toEqual(null);

    });

});

describe("test TestAllCombosTwoParameters", () => {

    // Standard handler
    function simpleHandler<T>(handler: (x: T) => void): JsonOptions<T> {
        return {
            success: (s: T) => {
                console.log("success: result ", s);
                handler(s);
            },
            error: (errorThrown: string) => {
                console.log("errorThrown=", errorThrown);
            },
            complete: () => {
                console.log("complete");
            },
            async: false,
        };
    }

    // MALFORMED - no @FormParam on GET
    // it("can execute testAllCombosTwoParametersGeFoFo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeFoFo('p0', 'p1', simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({"a": "P0P1", "b": "P0P1", "c": "P0P1"});
    // });

    // MALFORMED - no @FormParam on GET
    // it("can execute testAllCombosTwoParametersGePaFo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGePaFo('p0', 'p1', simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({"a": "P0P1", "b": "P0P1", "c": "P0P1"});
    // });

    // MALFORMED - no @FormParam on GET
    // it("can execute testAllCombosTwoParametersGeQuFo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeQuFo('p0', 'p1', simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({"a": "P0P1", "b": "P0P1", "c": "P0P1"});
    // });

    // MALFORMED - no @FormParam on GET
    // it("can execute testAllCombosTwoParametersGeBoFo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeBoFo({
    //         "a": "abc",
    //         "b": "def",
    //         "c": "ghi"
    //     }, 'p1', simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({"a": "ABCP1", "b": "DEFP1", "c": "GHIP1"});
    // });

    // MALFORMED - no @FormParam on GET
    // it("can execute testAllCombosTwoParametersGeFoPa", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeFoPa('p0', 'p1', simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({"a": "P0P1", "b": "P0P1", "c": "P0P1"});
    // });

    it("can execute testAllCombosTwoParametersGePaPa", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGePaPa("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersGeQuPa", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeQuPa("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    // MALFORMED - no Body on GET
    // it("can execute testAllCombosTwoParametersGeBoPa", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeBoPa({
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, "p1", simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "ABCP1", b: "DEFP1", c: "GHIP1"});
    // });

    // MALFORMED - no @FormParam on GET
    // it("can execute testAllCombosTwoParametersGeFoQu", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeFoQu("p0", "p1", simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    // });

    it("can execute testAllCombosTwoParametersGePaQu", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGePaQu("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersGeQuQu", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeQuQu("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    // MALFORMED - no Body on GET
    // it("can execute testAllCombosTwoParametersGeBoQu", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeBoQu({
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, "p1", simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "ABCP1", b: "DEFP1", c: "GHIP1"});
    // });

    // MALFORMED - no Body on GET
    // it("can execute testAllCombosTwoParametersGeFoBo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeFoBo("p0", {
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "P0ABC", b: "P0DEF", c: "P0GHI"});
    // });

    // MALFORMED - no Body on GET
    // it("can execute testAllCombosTwoParametersGePaBo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGePaBo("p0", {
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "P0ABC", b: "P0DEF", c: "P0GHI"});
    // });

    // MALFORMED - no Body on GET
    // it("can execute testAllCombosTwoParametersGeQuBo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeQuBo("p0", {
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "P0ABC", b: "P0DEF", c: "P0GHI"});
    // });

    // MALFORMED - no Body on GET
    // it("can execute testAllCombosTwoParametersGeBoBo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersGeBoBo({
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, {a: "abc", b: "def", c: "ghi"}, simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "ABCABC", b: "DEFDEF", c: "GHIGHI"});
    // });

    it("can execute testAllCombosTwoParametersPoFoFo", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoFoFo("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoPaFo", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoPaFo("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoQuFo", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoQuFo("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    // MALFORMED - can't have body param and form param
    // it("can execute testAllCombosTwoParametersPoBoFo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoBoFo({
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, "p1", simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "ABCP1", b: "DEFP1", c: "GHIP1"});
    // });

    it("can execute testAllCombosTwoParametersPoFoPa", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoFoPa("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoPaPa", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoPaPa("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoQuPa", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoQuPa("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoBoPa", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoBoPa({
            a: "abc",
            b: "def",
            c: "ghi",
        }, "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "ABCP1", b: "DEFP1", c: "GHIP1"});
    });

    it("can execute testAllCombosTwoParametersPoFoQu", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoFoQu("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoPaQu", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoPaQu("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoQuQu", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoQuQu("p0", "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0P1", b: "P0P1", c: "P0P1"});
    });

    it("can execute testAllCombosTwoParametersPoBoQu", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoBoQu({
            a: "abc",
            b: "def",
            c: "ghi",
        }, "p1", simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "ABCP1", b: "DEFP1", c: "GHIP1"});
    });

    // MALFORMED - can't have body param and form param
    // it("can execute testAllCombosTwoParametersPoFoBo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoFoBo("p0", {
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "P0ABC", b: "P0DEF", c: "P0GHI"});
    // });

    it("can execute testAllCombosTwoParametersPoPaBo", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoPaBo("p0", {
            a: "abc",
            b: "def",
            c: "ghi",
        }, simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0ABC", b: "P0DEF", c: "P0GHI"});
    });

    it("can execute testAllCombosTwoParametersPoQuBo", () => {
        let result: object = {};
        integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoQuBo("p0", {
            a: "abc",
            b: "def",
            c: "ghi",
        }, simpleHandler((s: object) => {
            result = s;
        }));
        expect(result).toEqual({a: "P0ABC", b: "P0DEF", c: "P0GHI"});
    });

    // MALFORMED - can't have more than one Body param
    // it("can execute testAllCombosTwoParametersPoBoBo", () => {
    //     let result: object = {};
    //     integration.TestAllCombosTwoParameters.testAllCombosTwoParametersPoBoBo({
    //         a: "abc",
    //         b: "def",
    //         c: "ghi",
    //     }, {a: "abc", b: "def", c: "ghi"}, simpleHandler((s: object) => {
    //         result = s;
    //     }));
    //     expect(result).toEqual({a: "ABCABC", b: "DEFDEF", c: "GHIGHI"});
    // });

});
