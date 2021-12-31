<img src="./js_logo2.png" />

# 빌드툴 관련 Q&A

- [이 링크](./build_tool.md)를 참조하시오

---

# 디자인패턴 관련 Q&A

- [이 링크](./준비중_디자인패턴.md)를 참조하시오

---

# 자바스크립트 Q&A


### Q. 프라미스(Promise)가 무엇인가?

- [이 링크](./promise.md)를 참조하시오

### Q. 제네레이터(Generator)가 무엇인가? 

- [이 링크](./준비중_제네레이터.md)를 참조하시오

### Q. 클로저 (Closure)가 무엇인가? 

- [이 링크](./클로저.md)를 참조하시오

### Q. 변수가 특정 타입인지 파악하려면 어떻게 해야하는가?

- [이 링크](./complete/how_to_type_check.md)를 참조하시오

### Q. 원시 데이터 타입(primitive data type)은 객체인가?
A. 원시 데이터 타입은 객체가 아니다.

### Q. 원시 데이터 타입이 객체가 아니라면 어떻게 메소드 호출이 되는가 ?
가령 `문자열`은 charAt 메소드가 있다. 자바스크립트에서 `a.b()` 구문은 a객체에서 b 메소드를 호출한다는 뜻이다. \
그러므로 원시 데이터 타입도 객체라고 볼 수 있지 않은가 ?\
\
A. 스펙상으로는 원시 데이터 타입이 객체가 아닌것은 맞다. 그럼에도 메소드 호출이 가능한 이유는 원시 데이터 타입이 래퍼 객체(wrapper object)에 감싸여져 있기 때문이다. 즉 객체처럼 사용할 수는 있지만 객체는 아니다. 이 말이 혼란스러울 수 있겠지만 그저 받아들이기 바란다

### Q. Number는 함수지만 생성자 함수로도 사용할 수 있다. 그런데 Number()와 new Number()는 다른 값을 리턴한다. Number()는 원시 데이터를 리턴하지만 new Number()는 Number 객체를 리턴한다. 이렇게 구분하는 이유가 있는가 ?

A. number를 프리미티브 타입으로 사용하던 객체로 사용하던 사용할 수 있는 메소드는 동일하다. 사실상의 차이가 없다\
만일 Number 객체에 프로토타입 메서드를 정의해 놓는다면 new Number()로 생성된 객체만 이용할 수 있기는 하다. 그러나 프로토타입 메소드를 정의하여 사용하는 것이 권장되지도 않으며 이런 유틸리티 메소드는 함수로 정의하여 사용해도 무방하다\
new Number()로 숫자를 객체로 취급하는 것은 권장되지 않는다. typeof로 검사했을 때 "number"가 아닌 "object"를 반환하는 등 혼란을 야기하기 때문이다

### Q. var와 let 차이가 무엇인가?

let과 var는 변수가 저장되는 환경 레코드(environment record)의 영역이 다르다\
\
만일 이 둘이 모두 전역 스코프에서 생성되었다고 가정해보자

```javascript
var a = 2;
console.log(window.a);

let b = 1;
console.log(window.b);

```
위의 코드에서 변수 `window.a`는 문제없이 출력된다.\
\
var로 선언된 변수는 전역변수의 프로퍼티로 저장되기 때문이다.\
\
그러나 `window.b`는 `undefined`를 출력한다. let은 전역객체의 프로퍼티로 저장되지 않기 때문이다.\
\
var는 객체 환경 레코드 (object environment records)에 저장된다. 환경 레코드라는 말이 어려울 수 있는데 그저 변수를 관리하는 시스템 영역이다.\
\
그런데 왜 이름이 `객체` 환경 레코드인가 하면 간단하게 `객체안에 담기기 때문`이라고 이해하면 쉽다.\
\
자바스크립트 런타임 환경에는 `window`나 `globalThis`와 같은 글로벌 객체가 존재한다. 이 객체안에 프로퍼티의 일부로 변수가 저장된다\
\
let과 const는 선언적 환경 레코드 (declarative environment record)에 저장된다. 선언적 환경 레코드는 객체 환경 레코드와 상호 무관한 시스템 영역에서 관리된다.\
\
이 두개의 레코드는 모두 환경 레코드(Environment Record)라는 변수를 담고있는 시스템 자원의 일부분이다. 시스템 자원이므로 자바스크립트 코드로는 직접적으로 접근할 수 없다\
\
다른 예제를 보자

```javascript
var a = 'test'
var a = 'test2'

```
위의 예제에서 a는 같은 이름으로 재선언되었는데 아무런 문제가 발생하지 않는다.\
\
즉 개발자가 실수로 재선언해도 알아차리기 어렵다.\
\
let, const는 그런 실수를 미연에 방지해준다
```javascript
let a = 'test'
let a = 'test2'
```
위와 같이 let으로 선언된 변수를 재선언하면 에러를 출력한다\
`Uncaught SyntaxError: Identifier 'a' has already been declared`\
하지만 그게 let과 const가 생겨난 의의는 아니다. let과 const는 블록 스코프를 구현하기 위해 만들어졌다

## Q. 변수를 선언할 때 직접 사용할 블록 스코프에 선언하는게 좋다는데 그 이유가 있는가 ?
A. 2가지 이유가 있다
1. 더이상 참조하지 않는 변수의 메모리 누수를 막아준다.
1. 변수를 참고할 때 스코프 체이닝을 시도할때 소모되는 탐색시간을 없애준다

### 객체

다음은 유효한가?
```javascript
const 객체2 = {
    [1 < 0] : 1
}
```
유효하다. 객체의 프로퍼티 이름을 지정할 때는 어떠한 종류의 표현식도 가능하기 때문이다. 위의 객체2는 `{false: 1}`를 만들어낸다
이 성질을 이용하면 if문을 사용하지 않고도 분기문을 구현할 수 있다. 아래의 예는 유저의 나이를 기반으로 성인인지 미성년인지를 구분하는 코드다
```javascript
function 성인확인창_띄우기(){ alert(`성인입니다`)}
function 미성년확인창_띄우기(){ alert(`미성년입니다`)}

const 성인나이 = 18

const 성인여부 = {
    [true] : 성인확인창_띄우기,
    [false] : 미성년확인창_띄우기,
}

const 유저 = {
    나이 : 17,
}

성인여부[유저.나이 > 성인나이]() ;
```
\
\
어떠한 종류의 표현식도 가능하기 때문에 아래도 가능하다
```javascript
function 함수 () {return 1}
const 객체 = {
    [함수] : 1
}
```
어떤 함수를 호출하지 않고 이름만 넣었을 때는 그 함수에 toString()메소드의 호출결과를 적용한다\
따라서 `객체`는 `{"function 함수 () {return 1}" : 1}`를 만들어낸다. 복잡해 보이지만 키(key)가 `"function 함수 () {return 1}"`이고 값이 1이다\
따라서 위의 객체에서 1을 참조할 때는 `객체["function 함수 () {return 1}"]`로 참조하거나 `객체[함수]`로 참조할 수 있다
함수, 배열, 객체 모두 마찬가지로 객체 프로퍼티 이름에 넣으면 그 대상에 toString()메소드의 호출결과를 적용한다\
예를들어
```javascript
const 배열 = [1,2,3,4,5]
const 객체3 ={
    [배열] : 1
}
```
객체 프로퍼티 이름에 배열을 적용했다. 따라서 배열에 toString을 적용한 `"[1,2,3,4,5]"`가 키(key)가 된다
따라서 위의 객체3에서 1을 참조할 때는 `객체3["[1,2,3,4,5]"]`으로 참조하거나 `객체3[배열]`로 참조할 수 있다
### 객체 디컨스트럭팅

```javascript
const object = {
    name : '김삿갓'
}
const {name : firstName} = object
```
위의 코드에서 아래 선언한 `firstName` 변수에 object.name의 값인 `김삿갓`이 할당된다



## 패턴매칭

결론부터 말하면 패턴 매칭을 함수호출에 적용하면  분기문을 없앨수 있다\
함수를 호출할 때 인자의 종류에 따라서 다른 함수를 호출해야 할 때가 있다\
가령 아래와 같은 코드의 경우다

```javascript
var 도형 = 도형구하기()
if(도형 instanceof 삼각형){
  삼각형넒이(도형)
} else if(도형 instanceeof 사각형){
  사각형넒이(도형)
}
```
위의 코드는 도형이 삼각형 객체의 인스턴스일 때 `삼각형넒이`함수를 호출하고, 사각형 객체의 인스턴스일 때는 `사각형넒이` 함수를 호출한다. 인자의 종류에 따라서 다른 함수를 호출하는 흔한 패턴이다\
위의 코드는 패턴 매칭을 사용할 경우 아래 코드로 치환될 수 있다
```javascript
var 도형 = 도형구하기()
넒이구하기(도형)
```
두말할 것 없이 코드가 간결해졌다. 어떻게 이것이 가능한가? 여러분은 아마도 함수 오버로딩이라는 개념을 들어봤을 것이다. 함수의 이름이 같고 인자의 갯수가 다를 때는 인자의 갯수에 맞추어 각기 다른 함수가 호출된다는 개념이다. 패턴 매칭도 이와 비슷한 개념이지만 한가지 중요한 차이점이 있다\
`패턴 매칭은 인자의 갯수가 같은 경우에 발동한다`\
인자의 갯수가 같은 경우에 인자의 패턴에 따라서 각기 다른 함수를 호출한다. 그래서 이름이 패턴 매칭이다.\
위의 코드에서는 각각 인자가 삼각형객체의 인스턴스인 케이스와, 인자가 사각형객체의 인스턴스인 경우를 별도로 정의해 놓아야 한다. 예를들어 아래와 같다
```
const 넒이구하기 = (삼각형) => (삼각형.밑변 * 삼각형.높이) / 2
const 넒이구하기 = (사각형) => (사각형.x * 사각형.y)
```
패턴매칭을 구현해놓은 수도 코드이다. 각각의 라인별로 각기다른 패턴을 정의해놓은 것이고 `넒이구하기`라고 적혀진 함수이름은 헤드(head)라고 부른다. 괄호안의 인자는 패턴이라고 부른다. 마지막으로 화살표(`=>`) 오른편은 함수의 바디(body)이며 실제로 함수가 실행되는 내용이다\
이와같이 정의해 놓으면 함수를 호출할 때 맨 위에 정의해놓은 패턴부터 차례대로 패턴에 해당되는지를 체크하고 맞으면 함수의 몸체를 실행한다. 패턴에 부합하지 않으면 다음 패턴을 체크한다. 이 과정을 모든 패턴에 대하여 수행한다. 이것은 그야말로 if-else문과 완전히 똑같은 흐름이다. 하지만 패턴매칭이 if-else문과 대비되는 점은 분기문을 실행흐름 중간에 삽입하지 않아도 되며 실행흐름과 떼어놓을 수 있다는 점이다. 그렇게 얻을 수 있는 결과는 if-else같은 지저분한 분기문을 제거할 수 있게 되고 그 결과 코드가 더 깔끔하고 이해하기 쉬워진다\

js에서 패턴매칭의 구문은 `match(비교할패턴) { 표현식 }` 의 형태로 기술된다
[링크](https://hackmd.io/@mpcsh/HkZ712ig_#/4)

## 대수적 효과 (algebraic effect, AE)
Q. 대수적 효과(AE)란 무엇인가 ?\
A. 대수적 효과는 ECMA스펙에 정식 등록된 사양은 아니다. 이 기능은 구현된 언어 자체가 거의 없다. 하지만 흥미로운 주제라서 다뤄본다.\
대수적 효과는 비순수 함수에서 부작용을 유발하는 코드부를 다른 곳으로 분리할 수 있게 해주는 문법적 도구다.\
대수적 효과의 개념은 본질적으로 프리 모나드와 동일하지만 구현 방식은 약간 다르다.  AE의 표현은 보다 직관적이다.
AE는 프로그램 논리를 보다 간결하게 표현하고 래핑할 수 있다

즉 대수효과의 의의는 코드의 분리에 있다. 아래와 같은 코드를 가정해보자\
![캡처](/img/대수적효과1.png)
이 함수는 서버와 통신하는 서브루틴을 포함한다. 따라서 이 함수는 부작용을 유발한다. 이 함수 내부에서 서버와 통신하는 코드가 존재하는 한 부작용을 걷어낼 방법은 없다. 하지만 대수적 효과를 사용하면 서버와 통신하는 코드를 다른 영역으로 분리할 수 있다. 그 코드는 대략 아래와 같다
![캡처](/img/대수적효과2.png)
위의 코드에서 주목할 점은 아래 biz함수의 `try {} handle (effect) {}` 구문이다. 이는 마치 `try-catch`구문을 연상시킨다. 루틴이 다른 곳으로 점프한다는 면에서는 트라이 캐치 구문과 같다. 하지만 `try-catch`구문에서는 에러가 발생해야만 루틴이 catch 블럭으로 점프하는데 반하여 `try-handle`구문에서는 에러 발생여부와 상관없이 무조건 루틴이 핸들(handle) 블럭으로 점프한다. 핸들 내부에서 이펙트의 타입을 확인하고 각 타입에 대응하는 루틴을 수행하는 것이 보일 것이다. 위의 예제에서는 이펙트의 종류가 `getInfo`인 경우에 getInfo함수를 호출하여 서버에 데이터를 요청했다. 데이터를 요청받은 이후에는 `resume`키워드가 작동하여 핸들 블럭으로 점프하기 이전의 루틴으로 이동한다. 즉 `biz`함수의 두번째 줄로 이동한다. 그리고 `biz`함수는 재개된다. 결과적으로 대수적 효과는 `try-catch`구문과 제네레이터를 합성한 독특한 구문으로 해석할수도 있다.

이렇게 한다고 해서 비순수함수가 순수함수가 되는것은 아닙니다. 그러나 부작용을 유발하는 코드를 분리해 둠으로서 보다 편하게 디버깅이 가능합니다
그외에 모든 이펙트를 이펙트 핸들러가 관리하므로 에러를 유발할 수 있는 이펙트가 한곳에 중앙집중화 된다는 이점이 있습니다
이렇게 중앙집중화된 이펙트는 관리가 쉽다. 예를 들어 단위테스트 중에 사이드이펙트 부분만 제외하고 테스트하고 싶은 경우는 핸들러 부분만 적당한 값으로 대체하면 테스트가 쉽게 가능해진다

대수적 효과를 적용하면 async함수를 프라미스가 아닌(non-promise) 로직으로 변경할 수 있는데 이 경우 중첩된 async로 인한 오염을 방지할 수 있다

대수적 효과(AE)는 계산적 효과(computational effect)를 대수식에서 변수를 바라보는 관점으로 처리하는 것인데 처리 방법은 이러한 변수를 외부의 이펙트 핸들러가 처리하도록 위임하는 것이다
특정 함수 안에서 이펙트를 유발하는 함수를 대수식에서의 변수와 같은 관점에서 처리한다
따라서 대수적 효과라는 표현은 매우 함축된 형태인데 전체 이름은 '대수식에서의 변수와 같은 효과'여야 한다.
- 南小北
https://www.zhihu.com/question/300095154

상세는 [이곳](https://www.zhihu.com/question/300095154)을 참조하시오

---

## js 런타임 환경

### setTimeout(0) 보다 빠르게 실행하는 방법이 있는가 ?
메시지채널 (MessageChannel)API의 postMessage를 사용하면 setTimeout보다 빠르게 일을 처리할 수 있다

### A. fetch등의 Web API 함수들을 console.log로 확인해보면 `ƒ fetch() { [native code] }`라고 출력한다. 여기서 `[native code]`가 무슨 뜻인가?
A. `[native code]`란 자바스크립트 내부의 코드가 아닌 js 실행코드를 관리하는 시스템에서 구현된 코드라는 의미이다. 이처럼 모든 웹 API는 자바스크립트 내부의 코드가 아닌 js 실행코드를 컨트롤하는 시스템 내부에 구현되어 있다. 크롬 웹브라우저의 예를 들면 웹 API는 렌더러 엔진인 블링크(blink) 내부에 구현되어 있다. 이 블링크는 C++로 구현되었고 따라서 블링크 내부에 구현된 웹 API도 C++로 구현되었다. fetch등의 웹 API가 실행되면 실행 흐름이 블링크 렌더러 엔진으로 전환되고 fetch함수에 대응되는 c++코드가 실행된다. 그 코드의 리턴값을 다시 자바스크립트 코드로 가져오는 흐름이 네이티브 코드의 실행방식이다.

### Q. fetch함수의 최종 응답객체인 리스폰스(Response) 객체에서 json메소드를 수행하면 json으로 변환된 값을 반환한다. 그런데 이 json 메소드를 다시 실행하면 에러가 발생한다.\
`Uncaught (in promise) TypeError: Failed to execute 'json' on 'Response': body stream already read`\
즉 json메소드는 한번밖에 사용할 수 없다. 그 이유가 왜인가?
A. 이것은 순전히 메모리 최적화의 일환이었다. 한 번 json메소드가 호출되면 리스폰스 객체가 가지고 있는 원본 데이터는 메모리에서 해제된다. 다시말해 리스폰스 객체는 메모리 사용을 최소화하는 방향으로 설계되었다. `json()`메소드를 호출하면 중간 객체에서의 버퍼링을 작게 유지할 수 있도록 Response 객체의 데이터를 점진적으로 소비한다.\
1메가 크기의 http 응답을 받은 뒤에 JSON 파일로 변환했다고 가정하자. Response가 `.json()` 호출 후에도 원래 리스폰스 바디 데이터를 유지하도록 설계된 경우에는 차지하는 메모리 공간이 `1메가 + 1메가 = 2메가`에 도달한다 (단순화를 위해 json 객체가 1MB라고 가정한다)\
json 객체가 생성되는 즉시 리스폰스 데이터를 해제할 수 있도록 설계하면 메모리 크기를 `소형크기의 버퍼 + 1MB` 정도로 줄일 수 있다.\
리스폰스 바디를 재사용하고 싶을 때만 클론`clone` 메소드를 사용하여 수동으로 객체를 복제할 수 있다.
[출처](https://github.com/whatwg/fetch/issues/196)

---

## 그 외 질문들
##### Q. 동적 타입으로서 자바스크립트가 가지는 치명적인 단점을 말해보시오

A. 자바스크립트는 컴파일 시점에 타입 체킹을 하지 않는다. 타입 불일치로 인한 오류는 런타임 환경에서 코드를 구동하면서 발견할 수 있다.
에러를 늦게 발견함으로서 개발자가 입는 시간적인 손실은 뼈아프다. 같은 오류라 하더라도 에러를 발견한 시점에 따라 디버깅에 소요되는 시간은 많은 차이를 보인다.
typescript는 이러한 단점을 보완하는 차원에서 만들어진 자바스크립트의 변형 언어이다.

##### Q. 소스를 보다보면 `<a href="javascript:"></a>`처럼 `javascript:`라는 문자열이 보인다. 이건 무슨 뜻인가 ?
A. 이것은 자바스크립트 코드를 실행하겠다는 뜻이다. 그런데 위의 예에서는 `javascript:`이후로 아무런 코드가 없다. 따라서 아무런 코드도 실행하지 않는다는 뜻이다. 그러면 의아할 수 있다. 그냥  `<a href=""></a>` 으로 표기하면 될 것을 왜 굳이 아무런 행동도 하지 않는 `javascript:`라는 코드를 집어넣은 것인가 ?  그 이유는  `<a href=""></a>` 으로 입력하면 a태그를 클릭했을 때 현재 페이지로 재접속하기 때문이다. 따라서 a태그를 입력했을 때 아무런 액션도 취하지 않게 하고 싶을 때 주로 사용하는 트릭이다.

참고 : https://stackoverflow.com/questions/20502636/what-does-javascript-do


##### Q. node.js에서 임포트할 때 `import Sidebar from '@/components/sidebar'`처럼 `골뱅이(@)`표기가  붙을 때가 있다. 이건 무슨 뜻인가 ?
A.  일단 모듈 로더는 ecma스펙이 아니다. 자바스크립트 언어의 관점에서 보면 이 모듈 식별자는 미지의 식별자이므로 당신이 사용하는 모듇 로더 또는 모듈 번들러에 전적으로 의지한다.  만일 당신이 `babel-plugin-root-import`를 사용한다면 이것은 해당 프로젝트의 루트 디렉토리를 의미한다


##### Q. 왜 자바스크립트는 호이스팅이라는 기능을 도입했는가 ?\
A. 호이스팅은 순전히 함수 때문에 생겨난 기능이다. 함수를 아래에 선언하더라도 코드 위쪽에서 호출할 수 있도록 하기 위해서 만든 개념이다. 자바스크립트의 창시자는 이런말을 했다

나는 var 호이스팅을 의도하지 않았다. 내가 원했던 것은 함수 호이스팅 이었으며 var 호이스팅은 부산물에 불과했다\
-- 브랜던 아이크\
var 호이스팅은 일종의 부작용 이었으므로 그가 ES 2015에서 let과 const라는 블럭 스코프용 변수를 만들 때는 호이스팅 기능을 제외시켰다

##### Q. 숏서킷 평가가 뭔가 ?\
A. 아래의 예를 참조하라

```javascript
const NUMBER = 10
const res = NUMBER && (NUMBER * 2)
```
위의 식에서 `&&` 연산자를 숏서킷 평가자라고 하고 `NUMBER && (NUMBER * 2)`를 숏서킷 평가라고 한다\
숏서킷 평가자(`&&`) 의 가장 오른쪽부터 순서대로 평가된다. 위의 예에서는 NUMBER라는 변수를 하나의 평가식으로 평가한다. 그 값은 10이고 이 값은 참값(truthy value)이다. 평가값이 참값일 때는 왼쪽의 평가식으로 넘어가고 만일 거짓값(falshy value)라면 그 자리에서 false를 리턴한다. 위의 예제에서 10은 참값이므로 왼쪽의 평가식으로 넘어간다. 평가식이 `(NUMBER * 2)`이므로 값은 20이 된다. 20은 참값이므로 false를 리턴하지 않고 다음 평가식으로 넘어간다. 그런데 다음 평가식이 없다. 이런 경우에는 최종 평가된 평가식을 왼쪽의 `res`변수에 할당한다. 따라서 res변수에는 20이 할당된다\
숏서킷 평가자는 앤드연산자(`&&`)와 or연산자(`||`)가 있다. 이런 숏서킷 평가 구문을 이용하면 if문을 없애고 분기문을 표현할 수 있다. 예를 들어 미성년자인 경우에 미성년자 알림 경고를 띄우는 프로그램을 작성한다고 해보자. 일반적인 경우에는 아래와 같이 작성할 수 있다

```javascript
function 미성년확인창_띄우기(){ alert(`미성년입니다`)}

const 유저 = {
    나이 : 17,
}

if(유저.나이 < 18) 미성년확인창_띄우기()
```

위의 코드를 숏서킷 평가자로 변환하면 아래와 같다

```javascript
function 미성년확인창_띄우기(){ alert(`미성년입니다`) }

const 유저 = {
    나이 : 17,
};

(유저.나이 < 18) && 미성년확인창_띄우기()
```
##### 직렬화가 무엇인가 ?
특정한 자료구조를 문자열로 바꾸는 작업을 말한다. js에서는 JSON.stringify메소드로 직렬화할 수 있다.\
직렬화는 주로 네트워크간 통신때 데이터를 넘겨줄때 사용한다.\
직렬화할 때 정의되지 값이 undefined 이거나 함수거나 심볼인 프로퍼티는 무시된다. 예를들어

```javascript
const 직렬화전 = {
    a : undefined,
    b : function a(){},
    c : Symbol(`a`),
    d : 'd'
}
const 직렬화후 = JSON.stringify(직렬화전);
console.log(직렬화후)
```

이 코드에서 `직렬화후`의 값은 `{"d":"d"}`이다. a, b, c라는 프로퍼티가 있었지만 이 프로퍼티는 직렬화되지 않았다.\
값이 undefined 이거나 함수거나 심볼인 프로퍼티는 직렬화되지 않는것이 확인된다.\
또한 키(key) 값이 심볼인 경우에도 값이 해당 프로퍼티는 생략된다. 예를 들어

```javascript
const 직렬화전 = {
    [Symbol(`a`)] : 1,
}
const 직렬화후 = JSON.stringify(직렬화전);
console.log(직렬화후)
```
이 객체는 키로 심볼을 사용했으므로 `직렬화후`의 값은 `"{}"`이다\
\
배열도 직렬화가 가능하다. 다만 배열의 원소가 undefined이거나 함수거나 심볼인 경우에는 null로 변환된다. 예를들어
```javascript
const 직렬화전 = [1, null, undefined, function a(){}, Symbol('')]
const 직렬화후 = JSON.stringify(직렬화전);
console.log(직렬화후)
```
위의 예에서 `직렬화후`의 값은 `"[1,null,null,null,null]"`이다.\
\
직렬화할 때 무한 순환참조되는 객체는 직렬화할 수 없다. 예를 들어
```javascript
const a = {}
const b = {}

a.b = b
b.a = a

JSON.stringify(a)
```
위의 예제는 a에서 객체 b를 참고하는데 객체 b에서는 a를 참고하는 무한순환이 이루어지는 경우다. 이 경우 `JSON.stringify(a)`를 수행하면 `Uncaught TypeError: Converting circular structure to JSON` 라는 에러가 발생한다

### 현재날짜를 표기하려면 어떻게 하는가 ?
[이 링크](./complete/how_to_get_current_time.md)를 참조하시오

### 코드에서 if문을 줄이고 싶은데 가능한 방법이 있는가 ?
[이 링크](./complete/avoid_conditional_statement.md)를 참조하시오

### 변수가 특정한 타입인지 체크하고 싶은데 어떻게 하는가 ?
[이 링크](./complete/how_to_type_check.md)를 참조하시오

#####  Q. 자바스크립트에는 파이썬의 range()함수같은 기능이 없는가?\
A. 빌트인 기능은 없다. 하지만 비슷하게 구현은 할수있다\
아래를 참조하라
```javascript
(from, to) => [...Array(to - from)].map((_,i)=> i + from)
```

#### Q. mjs확장자란 무엇인가 ?
A. js파일이 모듈로 정의되었다는 뜻이다