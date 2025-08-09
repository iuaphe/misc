// // old & lame way
// type PrependNextNum<A extends Array<unknown>> = A["length"] extends infer T
//   ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
//     ? X
//     : never
//   : never;
// type EnumerateInternal<A extends Array<unknown>, N extends number> = {
//   0: A;
//   1: EnumerateInternal<PrependNextNum<A>, N>;
// }[N extends A["length"] ? 0 : 1];
// type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[]
//   ? E
//   : never;

// // cool way
// type Lt<N, A extends any[] = []> = A["length"] extends N
//   ? A[keyof A & number]
//   : Lt<N, [...A, A["length"]]>;

// // type _ = Lt<4>;

// type SplitBy<D extends string, S> = S extends `${infer First}${D}${infer Rest}`
//   ? [First, ...SplitBy<D, Rest>]
//   : S extends `${infer Entire}`
//   ? [Entire]
//   : never;

// type Length<N, A extends any[] = []> = A["length"] extends N
//   ? A
//   : Length<N, [...A, "^_^"]>;

// type SingleToNumber = {
//   "0": 0;
//   "1": 1;
//   "2": 2;
//   "3": 3;
//   "4": 4;
//   "5": 5;
//   "6": 6;
//   "7": 7;
//   "8": 8;
//   "9": 9;
// } extends infer Normal
//   ? { [K in keyof Normal]: Length<Normal[K]> }
//   : never;

// type Add<A extends unknown[], B extends unknown[]> = [...A, ...B];
// type MinusMinus<A> = A extends [infer F, ...infer Rest] ? Rest : never;
// type Mult<A extends unknown[], B extends unknown[]> = B extends []
//   ? []
//   : Add<A, Mult<A, MinusMinus<B>>>;

// type FromString<NumberString> =
//   NumberString extends `${infer Entire extends keyof SingleToNumber}`
//     ? SingleToNumber[Entire]
//     : NumberString extends `${infer First extends keyof SingleToNumber}${infer Rest}`
//     ? Add<
//         Mult<SingleToNumber[First], Add<SingleToNumber[9], SingleToNumber[1]>>,
//         FromString<Rest>
//       >
//     : never;

// type Evaluate<S extends string> =
//   S extends `${infer F}(${infer Inside})${infer L}`
//     ? Evaluate<`${F}${Evaluate<Inside>}${L}`>
//     : SplitBy<" ", S> extends infer Split
//     ? EvaluateSplit<Split>
//     : "(should never happen)";

// type EvaluateSplit<Split> = EvaluateAdds<EvaluateMults<Split>>;

// type EvaluateMults<Split> = Split extends [infer One]
//   ? One extends never
//     ? "split contains never"
//     : [One]
//   : Split extends [
//       infer N1 extends string,
//       "*",
//       infer N2 extends string,
//       ...infer Lasts
//     ]
//   ? EvaluateMults<
//       [`${Mult<FromString<N1>, FromString<N2>>["length"]}`, ...Lasts]
//     >
//   : Split extends [infer N1, "+", infer N2, ...infer Lasts]
//   ? [N1, "+", ...EvaluateMults<[N2, ...Lasts]>]
//   : never;

// type EvaluateAdds<Split> = Split extends [infer One]
//   ? One extends never
//     ? "split contains never"
//     : One
//   : Split extends [infer N1, "+", infer N2, ...infer Lasts]
//   ? EvaluateAdds<[`${Add<FromString<N1>, FromString<N2>>["length"]}`, ...Lasts]>
//   : never;

// type _ = Evaluate<"7 * (3 + 3 * 2)">;

// type A = { a: string }

// const a: A = { a: "test", b: "test" }

// type A = (string | boolean)[];
// type B = (string | number)[];

// type X = A & B;

// type Test = 1 & { new (): string };

// const a = new (1 as Test)();

// type A = { a: number };
// type B = { b: number };
// type C = { c: number };

// type _ = (A | B) & (B | C);

// const _: _ = { a: 1, b: 1, c: 1 };

// const justABackslash = String.raw`\`;

// type A = string | undefined
// type B = A ?? number // string | number

// type X = string | 0;

// declare const x: X;
// declare const y: boolean;
// const __ = x && y;

// type Y = typeof (x ?? y); // string | number

// const map = [];

// declare global {
//   interface Array {
//     smartMap<T>(this: T): string;
//   }
// }

// const y = x.map((it) => it.toString());

type F = <T>(t: T) => T extends string ? "a string" : "not a string";

// type X1 = F(string)

const valueOfType = <T>(): T => undefined as any as T;

type T = {
  x: <U, V>(u: U, v: V) => U & V extends number ? "yes" : "no";
};

const x = valueOfType<T>().x(
  valueOfType<number | string>(),
  valueOfType<number | boolean>()
);

[1, 2, 3, 4].filter(
  function (n) {
    return n + this.a > 6;
  },
  { a: 4 }
);

const f = <T, U, V>(t: T, u: U, v: V) => {
  return typeof t === "string";
};
