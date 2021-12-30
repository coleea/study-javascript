# 변수가 특정 타입인지 확인하는 방법

---

### 변수가 문자열인지 확인하는 방법

##### typeof연산자를 이용하는 방법
```javascript
if(typeof 변수 === 'string') { console.log("나는 문자열입니다") }
```

##### String함수를 이용하는 방법
```javascript
if(변수 === String(변수)) { console.log("나는 문자열입니다") }
```

##### 문자열 리터럴 문법을 이용하는 방법
```javascript
if(변수 === `${변수}`) { console.log("나는 문자열입니다") }
```

##### `Object.prototype.toString`을 사용하는 방법
```javascript
if(Object.prototype.toString.call(변수) === '[object String]') console.log("나는 문자열입니다")
```

##### 문자열 합치기 트릭을 이용하는 방법
가장 간단한 방법이다
```javascript
if(변수 === 변수 + '') { console.log("나는 문자열입니다") }
```

---

###  변수가 숫자인지 확인하는 방법

##### typeof연산자를 이용하는 방법
```javascript
if(typeof 변수 === 'number') { console.log("나는 숫자입니다") }
```

##### Number 함수를 이용하는 방법
```javascript
if(변수 === Number(변수)) { console.log("나는 숫자입니다") }
```

##### `Object.prototype.toString`을 사용하는 방법
```javascript
if(Object.prototype.toString.call(변수) === '[object Number]') { console.log("나는 숫자입니다") }
```

##### 더하기 트릭을 이용하는 방법

가장 간단한 방법이다
```javascript
if(변수 === 변수 + 0) { console.log("나는 숫자입니다") }
```


---

### 변수가 정수인지 확인하는 방법

##### 비트연산자를 이용하는 방법
```javascript
if(변수 === (변수 | 0))  console.log("정수입니다")
```
위의 트릭은 플로트(float)를 정수로 변환할 때도 적용할 수 있다
하지마나 너무 큰 숫자에는 적용되지 않으므로 유의할 것

##### 모듈러 연산자를 이용하는 방법
```javascript
if(변수 === (변수 % 1))  console.log("정수입니다")
```

##### toFixed메소드를 이용하는 방법
```javascript
if(변수.toFixed && (변수 === Number(변수.toFixed())))  console.log("정수입니다")
```

---

### 변수가 float인지 확인하는 방법
위의 정수판별법을 응용하면 된다

##### 비트연산자를 이용하는 방법
```javascript
if(변수 === Number(변수) && 변수 !== (변수 | 0))  console.log("float입니다")
```

##### 모듈러 연산자를 이용하는 방법
```javascript
if(변수 === Number(변수) && 변수 !== (변수 % 1))  console.log("float입니다")
```

##### toFixed메소드를 이용하는 방법
```javascript
if(변수.toFixed && (변수 !== Number(변수.toFixed())))  console.log("float입니다")
```

---

### 변수가 null인지 확인하는 방법

##### 단순하게 null인지 체크한다
```javascript
if(변수 === null)  console.log("null입니다")
```

##### 또는 Object.prototype.toString 메소드를 사용한다
```javascript
if(Object.prototype.toString.call(변수) === '[object Null]')  console.log("null입니다")
```

---

### 변수가 undefined인지 확인하는 방법

유일한 언디파인드 판별법은 아래와 같다
```javascript
if(typeof 변수 === 'unefined')  console.log("undefined 입니다")
```
이 방법이 유일한 이유는 자바스크립트에서 존재하지 않는 변수에 접근하는 것 만으로도 에러를 던지지만 유일하게 typeof연산자의 인자로서 주어지는 변수는 존재하지 않는 변수라도 에러를 던지지 않기 때문이다.\

만일 객체의 프로퍼티가 언디파인드 인지를 판별하려면 아래의 방법으로도 가능하다
```javascript
if(변수.프로퍼티 === unefined)  console.log("undefined 입니다")
```
이게 가능한 이유는 특정 프로퍼티가 존재하지 않아도 에러를 던지지는 않기 때문이다

---

### 변수가 null 또는 undefined인지 확인하는 방법
null 판별법과 undefined 판별법을 합치면 된다
```javascript
if(typeof 변수 === 'unefined' || 변수 !== null)  console.log("null 또는 undefined 입니다")
```


만일 특정 프로퍼티가 널 또는 언디파인드 인지를 판별하려면 아래의 방법으로도 가능하다
```javascript
if(변수.프로퍼티 == null)  console.log("null 또는 undefined 입니다")
```
또는
```javascript
if(변수.프로퍼티 == undefined)  console.log("null 또는 undefined 입니다")
```

---

### 변수가 함수인지 확인하는 방법

##### `Object.prototype.toString`를 호출하는 방법
가장 장황한 방법이다
```javascript
if(Object.prototype.toString.call(변수) === '[object Function]') {console.log(`나는 함수입니다`)}
```

##### 컨스트럭터 프로퍼티를 이용하는 방법
```javascript
if(변수.constructor === Function) {console.log(`나는 함수입니다`)}
```

컨스트럭터 프로퍼티의 name프로퍼티를 이용할 수도 있다
```javascript
if(변수.constructor.name === 'Function') {console.log(`나는 함수입니다`)}
```


##### instanceof 연산자를 이용하는 방법
```javascript
if(변수 instanceof Function) {console.log(`나는 함수입니다`)}
```

##### typeof연산자를 이용하는 방법
```javascript
if(typeof 변수 === 'function') {console.log(`나는 함수입니다`)}
```

##### 마지막으로 조금 위험한 방법이지만 빌트인 함수를 체크하는 방법이 있다
```javascript
if(변수.call && 변수.apply) {console.log(`나는 함수입니다`)}
```
만일 팀에서 클래스를 사용하거나 프로토타입 상속등으로 함수를 정의해서 사용할 때는 얘기치 않은 작동이 발생할 수 있으므로 조심할 것

---

### 변수가 객체인지 확인하는 방법

##### typeof연산자를 이용하는 방법
```javascript
if(typeof 변수 === 'object' && !Array.isArray(변수) && (변수 !== null)) console.log('나는 객체입니다')
```
배열인지 검증하는 이유는 배열도 typeof연산자의 리턴값이 `'object'`이기 때문이다\
위의 예에서 중요한 포인트는 널(null)을 체크하는 부분인데 왜냐하면 널도 typeof 연산자의 리턴값이 object이기 때문이다\
\
주의 다음을 쓰지 마시오
```javascript
a instanceof Object
```
위의 식은 객체에서 파생된 배열과 함수도 참을 리턴한다. 사실 배열과 함수도 객체이므로 이것은 틀리건 아니다. 하지만 실용적인 관점에서 볼때 객체, 배열, 함수는 구분될 필요가 있다. 정 instanceof를 쓰고 싶으면 아래를 사용하시오

##### instanceof연산자를 이용하는 방법
```javascript
if((변수 instanceof Object) && !(변수 instanceof Array) && !(변수 instanceof Function)){
    console.log(`나는 객체입니다`)
}
```

주의 : Object함수를 쓰지 마시오
```javascript
변수명 === Object(변수명)
```
위의 예제는 배열도 참을 리턴한다\
\

##### 컨스트럭터 프로퍼티를 사용하는 방법
```javascript
if(변수.constructor === Object) console.log('나는 객체입니다')
```

컨스트럭터 프로퍼티의 name프로퍼티를 이용할 수도 있다
```javascript
if(변수.constructor.name === 'Object') console.log('나는 객체입니다')
```

##### Object.prototype.toString메소드를 사용하는 방법
```javascript
const a = {1:1}
if(Object.prototype.toString.call(a) === '[object Object]') console.log('나는 객체입니다')

```

---

### 변수가 배열인지 확인하는 방법

##### 첫번째 방법 : instanceof 연산자를 사용한다

```
const obj = [1,2,3,4,5]
if (obj instanceof Array) {console.log(`this is array`)}
```

##### 두번째 방법 : Array.Prototype.isArray() 메소드를 사용한다.
해당 메소드는 ECMAScript 5.1에 정식 추가되었다.
상세는 [MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) 을 참조
```javascript
const 변수 = [1,2,3,4,5]
if (Array.isArray(변수)) {console.log(`this is array`)}

```


##### 세번째 방법 : 객체의 constructor 프로퍼티를 활용한다.
배열의 constructor 프로퍼티는 전역객체인 Array를 레퍼런스로 가진다. 따라의 아래의 평가식은 true를 반환한다 
```javascript
const obj = [1,2,3,4,5]
if (obj.constructor === Array) {console.log(`this is array`)}
```


##### 네번째 방법 : Object.prototype.toString() 메소드를 사용한다

```javascript
Object.prototype.toString.call(array_object) === '[object Array]'
```

네번째 방법에서 주의할 점은
```javascript
변수명.toString() === '[object Array]'
```
로 검사할 경우 배열 여부를 확인할 수 없다.
왜냐하면 Array.prototype.toString() 메소드는 Object.prototype.toString() 메소드를 오버라이딩 하기 때문이다.

```javascript
const arr = [1,2,3,4,5] ;
console.log(arr.toString()) ;
```
위의 코드의 실행값은 `'[object Array]'`가 아니며
```javascript
1,2,3,4,5
```
이다.


