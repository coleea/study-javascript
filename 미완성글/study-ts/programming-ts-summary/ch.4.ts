
/*
function 리스트더하기(...숫자들 : number[]) : number {
    return 숫자들.reduce((총합, 수) => 총합 + 수 , 0)
 }

console.log(리스트더하기(1,2,3))
 */

/*
const 더하기 = (a:number, b: number) : number => a + b
console.log(더하기(1,2));
 */

/*
type 더하기시그니처 = (a:number, b:number) => number
const 더하기 : 더하기시그니처 = (a, b) => a + b
console.log(더하기(1,2));
 */

import {더하기시그니처} from './ch.4.type'
const 더하기 : 더하기시그니처 = (a, b) => a + b
console.log(더하기(1,2));
