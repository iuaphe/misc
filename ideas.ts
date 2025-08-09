// Imaginary number first class support

const un1, un2: () => maybe<number>
const addUserInputWithFirstDoubled = { x, y -> x * |(_, y) * (+) }

// auto un1, un2: () => number?
// auto addUserInputWithFirstDoubled: number? ::> {
//   auto n1 = un1() ?| return;
//   auto doubledN1 = n1 * 2;
//   auto n2 = un2() ?| return;
//   n1 + n2
// }



const c = (3 + 2i)^2


// First class quatornions

#{map(
    "i" = <1, 0>,
    "j" = <0, 1>,
) * { (string, vector) ->
  `const [ (n: number?!)(${string}^) ] = (n + 1) * ${vector}`
}.join('\n')}

const x = (i^ + 2j^) * (3i^ + 2j^) // == 7

// Multi-factorials (recursive)
const [ (x: number)!+=n ] = {
    if (x <= 1) 1 
    else (x - n, n)._>
}

// Meta-programming alternate
const [ (x: number)!+=n ] = {
    if (x <= 1) 1 
    else (x - n)#{`!` * n}
}

// More readable
const [ (x: number)!+=n ] = r[x, x - n, 1].prod()

// Optimally unreadable
const [(_: number)!+=n]={_?-(1.<=)*{_*__>(_-n,n)}+1}

5!! // 5 * 3 * 1 = 15

r[1, 100].map { _!! }.map(say)

declare const ...: never // TODO

internal const range: (
    leftInclusive: boolean, 
    rightInclusive: boolean, 
    by: number, 
    from: number, 
    to: number
) => list<number>

const [ r\(_: number, (by: number, )? _: number] ] = range(false, true, by + 1)
const [ r[_: number, (by: number, )? _: number] ] = range(true, true, by + 1)
const [ r\(_: number, (by: number, )? _: number\) ] = range(false, false, by + 1)
const [ r[_: number, (by: number, )? _: number\) ] = range(true, false, by + 1)

r[1, 3, infty] // [1, 3, 5, ...]

type const Reverse = <T>(Arr: T[]): T[] => {
    const Result = []
    for (const I = Arr.length - 1; I >= 0; I--) {
        Result.push(Arr[I])
    }
    return Result
}

type const Something = Reverse([number, string, boolean])
// = [boolean, string, number]

const something: Something = [true, "h", 5]

type const Map = <T, U>(Arr: T[], Fn: (T) => U): U[] => {
    const Result = []
    for (const I = 0; I < Arr.length; I++) {
        Result.push(Fn(Arr[I]))
    }
    return Result
}

type const SomethingElse = Map([1, 2, 3], (X) => X * 2)

// with dot notation
type const SomethingElse = [1, 2, 3].Map((X) => X * 2)

type const Filter = <T>(Arr: T[], Fn: (T) => boolean): T[] => {
    const Result = []
    for (const I = 0; I < Arr.length; I++) {
        if (Fn(Arr[I])) {
            Result.push(Arr[I])
        }
    }
    return Result
}

// variable that can only have even numbers using Filter
const onlyEvens: number . Filter((X) => X % 2 == 0) = [2, 4, 6, 8]
const onlyEvens: number . Filter((X) => X % 2 == 0) = [1] // error

const v = <2, 3>
say(|v|) // sqrt(2^2 + 3^2)

// cross product
const [ (v: vector) x (w: vector) ] = <v.y * w.z - v.z * w.y, v.z * w.x - v.x * w.z, v.x * w.y - v.y * w.x>

// vector projection
const [ proj_(v: vector)((w: vector)) ] = (v * w) / (w * w) * w

assert((a: number, b: string, c: boolean) & )b: string( == (a: number, c: boolean)) // Antituples (antuples?)

declare const ε: number;
const <F: infer In => infer Out, E: entryof In & (infer K: string = number)>[ d/d(k: K) (f: F) ] = {{ k: K, ...rest: unknown -> (f(k + ε, ...rest) - f(k, ...rest)) / ε }: F}

const f = { x: number, y: number -> x^2 + 3 * y }
const fPrime = d/dx (f)

say(fPrime(6, 7) ~= 12) // true

// <copilot>

// integrals
const [ ∫ (f: infer In => infer Out) (a: number) (b: number) ] = {
    let sum = 0
    for (const x = a; x < b; x += 0.001) {
        sum += f(x) * 0.001
    }
    return sum
}

const f = { x: number -> x^2 }
say(∫ (f) (0) (3) ~= 9) // true

// partial derivatives
const [ ∂ (f: infer In => infer Out) (k: string) ] = {
    let sum = 0
    for (const x = a; x < b; x += 0.001) {
        sum += f(x) * 0.001
    }
    return sum
}

const f = { x: number, y: number -> x^2 + 3 * y }
const fPrime = ∂ (f) ("x")

say(fPrime(6, 7) ~= 12) // true

// matrix multiplication
const [ (m: matrix) * (n: matrix) ] = {
    const result = []
    for (const i = 0; i < m.length; i++) {
        const row = []
        for (const j = 0; j < n[0].length; j++) {
            let sum = 0
            for (const k = 0; k < m[0].length; k++) {
                sum += m[i][k] * n[k][j]
            }
            row.push(sum)
        }
        result.push(row)
    }
    return result
}

const m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
const n = [
    [1, 2],
    [3, 4],
    [5, 6],
]

say(m * n) // [[22, 28], [49, 64], [76, 100]]

// matrix transpose
const [ (m: matrix) ^ ] = {

// </copilot>

with x = _, y = _, z = _, x & (y | z)

def [ (n: number)(!+=m) ] = { n ?- (1.<=) * { _ * (_ - m, m).__$ } + 1 }

// line by line
def [          // def blocks are used for 
               // declaring arbitrary syntax functions

  (n: number)  // denotes a number here (the parenthesis are 
               // ignored in the actual syntax)

  (!+=m)       // regex + for one or more `!`s, assign the
               // number to m (type annotations not needed 
               // becase this will always be a number)

] =
  {               
    n
      ?- (1.<=)            // convert to a maybe and filter out 1s
      * {                  // map to this lambda
        _ *                // `_` represents the encapsulated value

        (_ - m, m).__$     // more than one underscore represents 
                           // how far to go out in the lambda 
                           // tree and a trailing $ represents the 
                           // lambda itself; here it's used to 
                           // recursively run the 
                           // multi-factorial again with the
                           // reduced `n` and the same `m`.
      } 

      + 1                  // if this is none (i.e., filtered 
                           // earlier), return 1
}

say(5!!) // 5 * 3 * 1 = 15

const ( /pattern: string/ ) = { new RegEx(pattern) }

const [ |x: number| ] = { Math.abs(x) }
console.log(|-2|)

declare const isAAndBOrC = (x: unknown) => x is A & (x is B | x is C)

// Monad blocks: ?= is like bind I think
declare const un1, un2: () => maybe<number>
const addUserInputWithFirstDoubled = ?{
  const n1 ?= un1()
  const doubledN1 = n1 * 2
  const n2 ?= un2()
  n1 + n2
} // : maybe<number>

// Param constraints
declare const `/`: (a: number, b: number !{ _ != 0 }) => number

declare const sqrt: (x: number *{ _ >= 0 }*) => number

type A = 1
type B = 2
type C = A + B

// <compiled-ts>
type ArrayOfLength<N> = ArrayOfLengthHelper<N, []>;
type ArrayOfLengthHelper<N, A extends any[]> = A["length"] extends N
   ? A
   : ArrayOfLengthHelper<N, [...A, A["length"]]>;

type number_plus<A, B> = [...ArrayOfLength<A>, ...ArrayOfLength<B>]["length"]

type A = 1
type B = 2
type C = number_plus<A, B>
// </compiled-ts>

const [ ([ ((in _: number))+=x_dim ])%v+ ] = chunked(x_dim) + matrix

const scale_by_3: matrix = [ 3  0  0 ]
                           [ 0  3  0 ]
                           [ 0  0  3 ]

assert(scale_by_3(<1, 2, 3>) == <3, 6, 9>)

enum color {
  ORANGE
  RED
  PURPLE
}

const <...Ts>[ <T in Ts>( | (prop in props: string!)         )}    | ]
             [          ( | -+                               )}%>+ | ]
             [          ((| (in (values: map)(prop): T) )%v+ )}    | ] = 
{
  // implementation is left as an exercise to the reader
}
  
const table = | name        | birthday        | favorite_color            |
              | ----------- | --------------- | ------------------------- |
              | "Alice"     | @[ 05/14/1998 ] | color.ORANGE              |
              | "Bob"       | @[ 02/31/1999 ] | color.RED                 |
              | "Charlie"   | @[ 12/29/2008 ] | color.PURPLE              |
                .map[indexed] { person, i => person # (id = i)}

assert<typeof table == (name: string, birthday: date, favorite_color: color, id: number)>

declare const type Length: <T: array<?>> => number

type const Zipped = { <_: infer (...As), _: infer (...Bs *[_.Length == As.Length]*)> =>
  return As.Map[Indexed] { A, I => (A, Bs[I]) }
}

const zip: <A, B> . { _ => _.Zipped } = { /* ... */ }

const zipped = (1, true).zip(2, false)

assert(zipped == ((1, 2), (true, false)))
assert<typeof zipped == ((number, number), (boolean, boolean))>

// UNIT LITERALS

declare const vel: distance / second

assert< typeof (d/dt vel) == distance / second^2 >

// lol
const check_win = (board: ttt_board): maybe<'X' | 'O'> => board match {
  t|t|t
  _|_|_
  _|_|_ => some(t)

  _|_|_
  t|t|t
  _|_|_ => some(t)
  
  _|_|_
  _|_|_
  t|t|t => some(t)

  t|_|_
  _|t|_
  _|_|t => some(t)

  _|_|t
  _|t|_
  t|_|_ => some(t)

  t|_|_
  t|_|_
  t|_|_ => some(t)

  _|t|_
  _|t|_
  _|t|_ => some(t)

  _|_|t
  _|_|t
  _|_|t => some(t)

  _ => none
}

assert( check_win( X|O|  )
                 (  |X|O )
                 ( O| |X ) == 'X' )

def empty_board: ttt_board = _|_|_
                             _|_|_
                             _|_|_
                             

// 

                             H{   H}                                           
                             |{   |}                            
def [ (n: number)ane ] = H - C{ - C} - H                                           
                             |{   |}                            
                             H{   H}>*n                           
                                   
//

                    H   H   H   H                                           
                    |   |   |   |                            
 const butane = H - C - C - C - C - H                                           
                    |   |   |   |                            
                    H   H   H   H                            
                


assert(butane == (4)ane)

const decane = (10)ane

def molecular_mass(_: molecule) = atoms + map(atomic_weight) + sum

butane.molecular_mass().say()

def is_prime(_: number) = prime_factors + length + (==(1))

def prime_factors(_: number) = 2... + filter(is_prime)

// def [(_: number)!+=n]= ~@<>|<<|>|<>|<>|<>||>>|<<<|><|>|<>|<>|><|@~ (?-, 1, <=, *, __>, n, +)

// 9/13/22

const if = <F: unknown => infer Out>(condition: boolean, do: F): maybe<Out> => (do * map(false=0, true=1)(condition)) ?- (==(() => ()))
const else = <M: maybe<infer Out>, F extends unknown => Out>(do: F, if_fragment: M): Out => if_fragment + do()

// const x = if (1 == 2) {
//     "uh oh"
// } else {
//     "aweseom"
// }

// type A = string | null
// type B = A ?? number // string | number

// open in new browser


const callback: ((n: number, s: string) => boolean) => ()

// GORP OPERATOR (eats tuples)

assert(
    (x: number, y: number, z: number) *<* (y: number) == (x: number, z: number)
)

// equivalent to ebety `callback(([, s]) => println(s.toLowerCase().length()))` (or whatever print is)
callback(*<*(n: number) + lower_case + length + say)

// equivalent to ebety `callback(([n, ]) => println(n * 3 % 2))`
callback(*<*(s: string) + *3 + %2 + say)

// alternatively
callback([*<*(n: number), lower_case, length, say].sum())
callback([*<*(s: string), *3, %2, say].sum())

const x = 2

x ~/= 1 // x = 1 / x

x.say() // 0.5

// ZUMBA OPERATOR (Zero-Underscore Multi-Branching Application operator)

const fizz_buzz = (N: Number) => {
    r[1, n].for_EACH {
        (
            _ ?- (%3 + ==0),
            _ ?- (%5 + ==0), ^_^
        ) * { +LiSt(_*, INTERSECT!!(_*)).zip! (+list("Fizz", "Buzz", "FizzBuzz")) * { l, m ->
            Say(if (r[1, n].inCLUDES???(l)) m else l)
        }
    }
}



// NEGATIVE STRINGS

say("a")
say("b")
say("c")

// prints:
// a
// b
// c

say("a" + -"\n")
say("b" + -"\n")
say("c" + -"\n")

// prints:
// abc



// advanced assignment operators

const x = 5;

x += 3; // 8
x /= 2; // 4
x _!=; // 24 (factorial)
x -_=; // -24
x += 32; // 8

x log= 2; // x = log(2, x) == 3

// ~ is used to switch the place of the two numbers

x ~-= 6; // 6 - 3 == 3
x ~/= 1; // 1 / 3
x ~/= 5; // 5 / (1 /3) =- 15

def gcd(a: number, b: number) = * + prime_factors + unique + product;

x gcd= 10; // x = gcd(10, x) == 30
x gcd= 12; // x = gcd(12, x) == 60

// priority meta-operator

// lame way
const x = (1 + 3) * (2 + 1 / (4 + 6))

// cool way
const x = 1 !+ 3 * (2 + 1 / 4 !+ 6)

// coolest way
const x = 1 !+ 3 * 2 !+ 1 !!/ 4 !!!+ 6


// scoped logical relation type assertions

let a: number | string;
let b: number | string;
let c: number | string;

declare typeof a === typeof b === typeof c

if (typeof a === 'string') {
    return a + b + c; // string
} else {
    return a * b * c; // number
}