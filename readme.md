# javascript 관련내용

### 객체 디컨스트럭팅

```javascript
const object = {
    name : '김삿갓'
}
const {name : firstName} = object
```
위의 코드에서 아래 선언한 `firstName` 변수에 object.name의 값인 `김삿갓`이 할당된다

## 패턴매칭
이 프로포절은 스테이지 1이다. [링크](https://hackmd.io/@mpcsh/HkZ712ig_#/4)
패턴매칭의 구문은 간단하다. `match(비교할패턴) { 표현식 }` 의 형태로 기술된다

## 대수효과 (algebraic effect)
이건 스테이지 1도 안된다
대수적 효과(AE)를 적용하면 비순수 함수에서 부작용을 유발하는 코드부를 다른 곳으로 분리할 수 있습니다
그 외에 async함수를 non-promise 로직으로 변경할 수 있는데 이 경우 nested async로 인한 오염을 방지할 수 있습니다
상세는 [이곳](https://www.zhihu.com/question/300095154)을 참조하시오

![캡처](/img/대수적효과1.png)
![캡처](/img/대수적효과2.png)
