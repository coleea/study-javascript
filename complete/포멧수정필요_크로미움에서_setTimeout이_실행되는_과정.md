
# 크로미움 웹브라우저에서 setTimeout이 실행되는 과정


```javascript
<script>
   f1() ;

   setTimeout(()=>{
     console.log('hi') ;
   }, 1000) ;

   function f1() {
     return 1 ;
   }
</script>

```
브라우저 내부에서 위의 코드가 실행될 때 아래와 같은 루틴으로 처리된다.\
\
`<script>` 내부는 자바스크립트 코드로 이루어져 있고 이 코드는 웹브라우저의 렌더러 엔진이 단독으로 처리할 수 없다. 따라서 자바스크립트 가상 머신에게 script 내부의 처리를 요청한다.\
\
크로미움에서 해당 작업은 v8이라는 이름의 자바스크립트 가상머신이 수행한다.\
\
v8은 먼저 f1 함수를 호출한다. f1의 수행이 종료되면 이어서 setTimeout 함수를 호출한다.\
\
setTimeout 함수를 호출한 주체는 v8 자바스크립트 엔진이지만 setTimeout은 v8에 구현되어 있지 않다.\
\
v8은 ECMAScript 스펙의 구현체이지만 setTimeout은 ECMAScript의 스펙에 정의되어 있지 않기 때문이다.\
\
setTimeout은 WHATWG에서 관리하는 HTML Living Standard 스펙에 정의되어 있다 ([링크](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout))\
\
이처럼 WHATWG HTML Living Standard 스펙에 정의되어 있는 자바스크립트 함수를 Web API라고 한다\
\
이러한 WebAPI는 웹브라우저의 렌더러 엔진에 구현되어 있다. 크로미움의 렌더러 엔진을 블링크라고 한다.\
\
v8엔진은 Blink IDL이라는 인터페이스를 통하여 블링크 엔진 내부에 구현된 WebAPI 함수의 실제 구현체를 호출한다.\
\
setTimeout의 실제 구현체는 블링크 엔진 내부에 있는 WindowOrWorkerGlobalScope클래스의 SetTimeout메소드에 정의되어 있다.\
\
자바스크립트 코드 내부에서 setTimeout을 호출하는 순간 자바스크립트 코드 실행부는 일시 중지되고 제어권은 블링크 엔진에게 이전된다.\
\
블링크 엔진 내부에서 setTimeout 함수의 루틴이 종료되면 리턴값인 타이머 ID를 v8에게 반환하면서 자바스크립트 코드 실행부가 작업을 재개한다.\
\
다음은 WindowOrWorkerGlobalScope::SetTimeout 메소드이다

```cpp
int WindowOrWorkerGlobalScope::setTimeout(
    ScriptState* script_state,
    EventTarget& event_target,
    V8Function* handler,
    int timeout,
    const HeapVector<ScriptValue>& arguments) {

  ExecutionContext* execution_context = event_target.GetExecutionContext();
  if (!IsAllowed(execution_context, false, g_empty_string))
    return 0;
  auto* action = MakeGarbageCollected<ScheduledAction>(
      script_state, execution_context, handler, arguments);

  return DOMTimer::Install(execution_context, action,
                           base::TimeDelta::FromMilliseconds(timeout), true);
}
```
(참고 : third_party/blink/renderer/core/frame/window_or_worker_global_scope.cc)\
\
위의 코드는 C++로 작성되었다. 이처럼 블링크 렌더러 엔진을 비롯한 대부분의 크로미움 소스는 C++로 작성되었다.\
\
위의 코드에서 마지막 return 직전에 호출되는 DOMTimer::Install 메소드는 타이머계열 메소드 (setInterval, setTimeout)의 수행에 사용된다. 내부로 진입해 보겠다.

```cpp
int DOMTimer::Install(ExecutionContext* context,
                      ScheduledAction* action,
                      base::TimeDelta timeout,
                      bool single_shot) {
  int timeout_id = context->Timers()->InstallNewTimeout(context, action,
                                                        timeout, single_shot);
  return timeout_id;
}
```
(참고 : third_party/blink/renderer/core/frame/dom_timer.h)\
\
DOMTimer::Install메소드는 내부에서 DOMTimerCoordinator 인스턴스의 InstallNewTimeout 메소드를 호출한다.\
\
DOMTimerCoordinator::InstallNewTimeout 메소드는 실질적인 setTimeout의 구현체이다. 내부로 진입해 보겠다.

```cpp
int DOMTimerCoordinator::InstallNewTimeout(ExecutionContext* context,
                                           ScheduledAction* action,
                                           base::TimeDelta timeout,
                                           bool single_shot) {
  // FIXME: DOMTimers depends heavily on ExecutionContext. Decouple them.
  DCHECK_EQ(context->Timers(), this);
  int timeout_id = NextID();
  timers_.insert(timeout_id,
                 MakeGarbageCollected<DOMTimer>(context, action, timeout,
                                                single_shot, timeout_id));
  return timeout_id;
}
```

(참고 : third_party/blink/renderer/core/frame/dom_timer_coordinator.cc)\
\
DOMTimerCoordinator::InstallNewTimeout 메소드는 크게 2가지 작업을 수행한다.\
\
첫째로 콜백함수의 타이머 id를 생성한다. 이는 NextID() 메소드를 호출함으로서 수행된다.\
\
둘째로 콜백함수를 스케줄링한다. 해당 작업은 콜백함수를 테스크 큐에 삽입함으로서 수행된다. 테스크 큐라는 용어는 이벤트 루프에 대해 조사해 본 적이 있다면 들어본 적이 있을 것이다. 테스크 큐는 queue라는 자료구조의 구현체로서 수행할 테스크를 후입선출 방식으로 실행하는 자료구조를 의미한다. 여기에는 자바스크립트 setTimeout 함수의 첫번째 인자로 삽입된 콜백함수가 스케줄링된다.\
\
엄밀하게 이야기하면 콜백함수가 직접 스케줄링되지 않으며 콜백함수를 프로퍼티로 가진 DOMTimer 인스턴스가 스케줄링된다. 스케줄링되는 DOMTimer 인스턴스 내부에 setTimeout 콜백함수가 프로퍼티로 저장되어 있으며 이 프로퍼티의 이름은 action_이다.\
\
실제 테스크 수행시에는 최종적으로 해당 콜백함수가 실행된다.\
\
이 스케줄링 과정은 위의 InstallNewTimeout 메소드에서는 확인하기 어렵다. 위의 코드에서는 timers_.insert() 메소드를 호출하는 과정에서 두번째 인자로 DOMTimer 인스턴스가 전달되는 것을 확인할 수 있는데, 덕분에 timers_.insert() 를 호출하는 행위를 스케줄링 작업으로 오해할 수 있다. 사실 timers_ 는 자바스크립트에서 clearTimeout() 함수를 호출할 때 해당 테스크의 스케줄링을 취소하려는 목적으로 사용된다.\
\
실제 스케줄링 작업은 DOMTimer가 생성자를 호출할 때 이루어진다. DOMTimer 생성자의 내부로 진입해 보겠다.

```cpp
DOMTimer::DOMTimer(ExecutionContext* context,
                   ScheduledAction* action,
                   base::TimeDelta timeout,
                   bool single_shot,
                   int timeout_id)
    : ExecutionContextLifecycleObserver(context),
      TimerBase(nullptr),
      timeout_id_(timeout_id),
      // Step 9:
      nesting_level_(context->Timers()->TimerNestingLevel()),
      action_(action) {
  DCHECK_GT(timeout_id, 0);

  // Step 10:
  if (timeout < base::TimeDelta())
    timeout = base::TimeDelta();

  // Steps 12 and 13:
  // Note: The implementation increments the nesting level before using it to
  // adjust timeout, contrary to what the spec requires crbug.com/1108877.
  IncrementNestingLevel();

  // Step 11:
  // Note: The implementation uses >= instead of >, contrary to what the spec
  // requires crbug.com/1108877.
  if (nesting_level_ >= kMaxTimerNestingLevel && timeout < kMinimumInterval)
    timeout = kMinimumInterval;

  // Select TaskType based on nesting level.
  TaskType task_type;
  if (timeout.is_zero()) {
    task_type = TaskType::kJavascriptTimerImmediate;
    DCHECK_LT(nesting_level_, kMaxTimerNestingLevel);
  } else if (nesting_level_ >= kMaxTimerNestingLevel) {
    task_type = TaskType::kJavascriptTimerDelayedHighNesting;
  } else {
    task_type = TaskType::kJavascriptTimerDelayedLowNesting;
  }
  MoveToNewTaskRunner(context->GetTaskRunner(task_type));

  if (single_shot) {
    StartOneShot(timeout, FROM_HERE);
  } else {
    // TODO(crbug.com/402694): Don't clamp interval timers to 1ms here
    timeout = std::max(timeout, base::TimeDelta::FromMilliseconds(1));
    StartRepeating(timeout, FROM_HERE);
  }

 // ...
}
```
( 참고 : third_party/blink/renderer/core/frame/dom_timer.cc )
\
소스는 매우 장황하고 이해하기 어렵다. 돔타이머 생성자의 루틴은 크게 두가지 작업으로 나뉜다\
\
먼저 자바스크립트 setTimeout의 두번째 인자로 삽입된 timeout 수치를 재조정한다.\
\
그 이후 조정된 timeout수치를 참고하여 스케줄링을 수행한다.\
\
여기서 timeout수치를 재조정한다는 게 무슨 말인지 의아할 수 있다.\
\
setTimeout함수는 유저가 입력한 timeout수치가 지나치게 낮으면 이를 재조정하도록 설계되어 있다.\
\
이 규칙은 WHATWG HTML Living Standard에 명시되어 있다 ([링크](html.spec.whatwg.org/multipage/timers-and-user-prompts.html))\
\
위의 소스코드에서 Step 9, Step 10, Step 11 등의 주석을 확인할 수 있는데 이는 HTML 리빙 스탠다드에 명시되어 있는 타이머 초기화 스탭을 구현하는 것을 의미한다.\
\
예를 들어 스탭 11의 명세는 아래와 같다.\
\
If nesting level is greater than 5, and timeout is less than 4, then set timeout to 4.\
-> 중첩 레벨이 5보다 크고 timeout수치가 4 미만인 경우, timeout수치를 4로 재조정한다\
\
timeout 수치를 재조정 작업이 완료되면 스케줄링에 필요한 모든 작업이 완료되었고 소스의 아랫부분에서 확인할 수 있는 것처럼 StartOneShot 메소드를 호출한다. 이는 1회만 호출하는 원샷 타이머의 형태로 스케줄링을 진행하겠다는 뜻이다.\
\
StartOneShot 메소드 내부에서 몇번의 서브루틴이 있으며 최종적으로 TimerTaskRunner가 postDelayedTask메소드를 호출하여 콜백함수를 테스크 큐에 enqueue함으로서 스케줄링이 수행된다. 이는 아래 소스에서 확인할 수 있다\

```cpp
void TimerBase::SetNextFireTime(base::TimeTicks now, base::TimeDelta delay) {

    //  ..생략

    web_task_runner_->PostDelayedTask(
        location_, BindTimerClosure(weak_ptr_factory_.GetWeakPtr()), delay);
  }
}
```
(참고 : third_party/blink/renderer/platform/timer.cc)\
\
위의 코드에서 PostDelayedTask 메소드의 첫번째 인자인 location_은 DOMTimer 인스턴스이며 해당 인스턴스에 setTimeout의 콜백함수가 저장되어 있다. 세번째 인자인 delay은 타이머 초기화 스탭으로 재조정된 timeout 수치이다.\
\
PostDelayedTask라는 용어에서 post는 테스크를 큐에 삽입하는 행위이고 DelayedTask는 해당 테스크가 시간차를 두고 실행되는 테스크라는 것을 의미한다.\
\
결론적으로 setTimeout의 콜백함수는 TimerTask로 분류되며 해당 테스크는 TimerTaskRunner 인스턴스가 컨트롤한다\
\
여기서 TimerTaskRunner 인스턴스가 컨트롤하는 테스크 큐를 Frame Throttleable 테스크 큐라고 부른다.\
\
Frame Throttleable 테스크 큐는 블링크 렌더러 엔진의 메인 스레드 스케줄러가 관리하는 약 19여개의 테스크 큐 중 하나로서 setInterval, setTimeout과 같은 자바스크립트 수준의 타이머를 관리한다.\
\
메인 스레드 스케줄러는 Frame Throttleable 테스크 큐 외에도 약 19여개의 테스크 큐를 관리한다.\
\
아래는 메인스레드 테스크 큐의 종류이다.

```cpp
enum class QueueType {
  kControl = 0,
  kDefault = 1,
  kFrameLoading = 5,
  kCompositor = 8,
  kIdle = 9,
  kTest = 10,
  kFrameLoadingControl = 11,
  kFrameThrottleable = 12,
  kFrameDeferrable = 13,
  kFramePausable = 14,
  kFrameUnpausable = 15,
  kV8 = 16,
  kInput = 18,
  kDetached = 19,
  kWebScheduling = 24,
  kNonWaking = 25,
  kIPCTrackingForCachedPages = 26,
  kOther = 23,
  kCount = 27
};
```
< 참고 : third_party/blink/renderer/platform/scheduler/main_thread/main_thread_task_queue.h>\
\
위 코드에서 각 QueueType 에 할당된 정수는 코드 내부적으로 가독성을 올리기 위한 수단이며 테스크 우선순위와는 무관하다.\
\
물론 각 테스크 큐는 각자의 고유한 우선순위를 가지고 있다. 메인 스케줄러는 이러한 여러가지 종류의 테스크 큐를 우선순위 정책에 입각하여 실행한다. 각 테스크 큐의 우선순위는 아래에서 설명하겠다.\
\
여기서부터 조금 더 깊이 들어가보겠다\
\
setTimeout의 콜백함수가 스케줄링 되는 테스크 큐는 Frame Throttleable 테스크 큐 이지만 더 정확히 이야기하면 Frame Throttleable 테스크 큐 내부의 delayed_incoming_queue에 삽입된다.\
\
조금 혼란이 올 수가 있는데, 하나의 테스크 큐 내부에는 4가지 종류의 테스크 큐가 있다

1. immediate_incoming_queue
2. immediate_work_queue
3. delayed_incoming_queue
4. delayed_work_queue

이 중 타이머 수행에는 앞에 delayed라는 이름이 붙여진 2개의 테스크 큐가 사용된다.\
\
setTimeout의 콜백함수는 먼저 delayed_incoming_queue에 삽입된다.\
\
delayed_incoming_queue는 유저가 인터벌 값으로 설정한 밀리세컨드 값을 참조하여 해당 콜백함수가 호출되는 시점이 되면 delayed_work_queue로 이전한다.\
\
delayed_work_queue에 이전된 함수는 테스크를 수행할 준비가 되었다는 뜻이며 이는 블링크의 메인스레드 스케줄러에 의해 실행될 수 있다.\
\
이처럼 delayed_incoming_queue의 테스크를 delayed_work_queue로 옮기는 작업은 TimeDomain 클래스가 담당하며 TimeDomain 클래스가 UpdateDelayedWorkQueue메소드를 호출함으로서 이전이 수행된다. TimeDomain 클래스는 OS가 제공하는 시스템 틱 API를 호출하여 현재시간을 계산한다.\
\
windows OS의 경우 시스템 틱을 호출하는 루틴은 time_win.cc에 정의되어 있다.\
\
여기까지가 setTimeout의 콜백함수를 스케줄링 하는 과정이었다. 다시 자바스크립트의 코드 실행부로 돌아가보겠다.

```javascript
<script>
   f1() ; 
   
   setTimeout(()=>{
     console.log('hi') ; 
   }, 1000) ; 
   
   function f1() {
     return 1 ; 
   }
</script>
```

setTimeout의 호출이후 자바스크립트의 메인 프로그램이 종료된다. 메인 프로그램의 종료이후 제어권은 embedder(임베더)에게 이전된다.\
\
임베더는 자바스크립트의 코드실행을 호출한 주체를 일컫는 데 웹브라우저의 경우 임베더는 렌더러 엔진의 메인스레드이다.\
\
즉 제어권이 렌더러 엔진인 블링크의 메인 스레드에게 이전된다. 제어권이 이전되면 렌더러 엔진은 자바스크립트의 마이크로테스크 큐를 실행할 조건이 되는지 검사한다.\
\
여기서 자바스크립트의 마이크로테스크 큐를 실행하는 주체가 자바스크립트 엔진이 아닌 자바스크립트 엔진의 임베더라는 사실을 알 수 있다.\
\
콜스택의 depth가 0인지를 체크하여 0이라면 마이크로테스크 큐가 소진될 때 까지 반복하여 마이크로테스크를 수행한다.\
\
마이크로테스크 작업이 모두 종료되면 블링크 메인스레드의 스케줄러가 스케줄링 정책에 입각하여 다음 테스크를 선택하는 루틴을 수행한다. 여기서부터 흔히 말하는 이벤트루프 단계가 수행된다.\
\
위에서 언급했듯이 메인스레드의 스케줄러는 여러가지 종류의 테스크 큐를 우선순위 정책에 입각하여 실행한다.\
\
여기서 우리는 setTimeout의 콜백함수가 스케줄링 되어있는 Frame Throttleable 테스크 큐가 언제 실행되는지에 관심이 있다.\
\
Frame Throttleable 테스크 큐의 우선순위는 0~11까지 책정되어 있는 우선순위 값 중 7이다. 숫자값이 클수록 우선순위가 높다.

```cpp
enum class PrioritisationType {
  kInternalScriptContinuation = 0,
  kBestEffort = 1,
  kRegular = 2,
  kLoading = 3,
  kLoadingControl = 4,
  kFindInPage = 5,
  kExperimentalDatabase = 6,
  kJavaScriptTimer = 7,
  kHighPriorityLocalFrame = 8,
  kCompositor = 9,  // Main-thread only.
  kInput = 10,

  kCount = 11
};
```

(참고 : third_party/blink/renderer/platform/scheduler/main_thread/main_thread_task_queue.h)
\
위의 코드에서 kJavaScriptTimer는 Frame Throttleable 테스크 큐의 우선순위이다.\
\
따라서 값이 7보다 높은 테스크 큐에 예약된 테스크가 이미 존재하는 상황에서는 setTimeout의 콜백함수는 영원히 실행되지 않는다.\
\
이런 상황을 기아상태라고 한다.\
\
우선순위가 7보다 높은 테스크 큐에는 컴포지터 테스크 큐와 유저인풋 테스크 큐 등이 존재한다.\
\
만일 우선순위가 7보다 높은 테스크 큐에 테스크가 없다면 Frame Throttleable 테스크 큐 내부의 immediate_work_queue와 delayed_work_queue에 수행할 테스크가 존재하는지 체크한다.\
\
만일 테스크가 존재한다면 해당 테스크를 수행한다.\
\
만일 존재하지 않는다면 우선순위가 7보다 낮은 테스크 큐에 테스크가 존재하는지 체크한다.\
\
블링크의 테스크 스케줄링은 위와 같은 방식으로 수행된다. 이것이 흔히 말하는 이벤트 루프의 민낯이다.\
\
1000ms가 지나서 delayed_work_queue에 수행할 테스크가 적재되었다면 스케줄러는 해당 테스크를 수행한다.\
\
위에서 setTimeout의 콜백함수는 DOMTimer 인스턴스의 형태로 스케줄링 된다고 언급하였다.\
\
DOMTimer는 Fired 메소드를 호출하여 해당 콜백함수가 트리거 됨을 알린다. Fired 메소드의 코드는 아래와 같다\

```cpp

void DOMTimer::Fired() {

  // .. 생략

  // Simple case for non-one-shot timers.
  if (IsActive()) {
    DCHECK(is_interval);

    // Steps 12 and 13:
    // Note: The implementation increments the nesting level before using it to
    // adjust timeout, contrary to what the spec requires crbug.com/1108877.
    IncrementNestingLevel();

    // Make adjustments when the nesting level becomes >= |kMaxNestingLevel|.
    // Note: The implementation uses >= instead of >, contrary to what the spec
    // requires crbug.com/1108877.
    if (nesting_level_ == kMaxTimerNestingLevel) {
      // Move to the TaskType that corresponds to nesting level >=
      // |kMaxNestingLevel|.
      MoveToNewTaskRunner(
          context->GetTaskRunner(TaskType::kJavascriptTimerDelayedHighNesting));
      // Step 11:
      if (RepeatInterval() < kMinimumInterval)
        AugmentRepeatInterval(kMinimumInterval - RepeatInterval());
    }

    DCHECK(nesting_level_ < kMaxTimerNestingLevel ||
           RepeatInterval() >= kMinimumInterval);

    // No access to member variables after this point, it can delete the timer.
    action_->Execute(context);

    context->Timers()->SetTimerNestingLevel(0);

    return;
  }
```

여전히 소스는 장황하고 이해하기 어렵다. 맨 아래에서 세번째 명령어인 action_->Execute(context) ; 부분은 실질적인 콜백함수의 호출로 이어진다. action_ 프로퍼티는 ScheduledAction 클래스의 인스턴스인데 해당 인스턴스는 V8 엔진과 블링크 렌더러 엔진의 브릿지 역할을 수행한다.\

```cpp
void ScheduledAction::Execute(ExecutionContext* context) {

  // .. 생략
  script->RunScriptOnScriptStateAndReturnValue(script_state_->Get());
}
```

< 참고 : third_party/blink/renderer/bindings/core/v8/scheduled_action.cc>\
\
위의 소스코드에서 RunScriptOnScriptStateAndReturnValue 메소드는 직접적인 스크립트의 수행을 V8에게 요청한다.\
\
이 작업은 V8ScriptRunner클래스가 CallFunction을 호출하여 수행된다.\
\
이로서 자바스크립트 엔진에게 제어권이 넘어가게 되고 setTimeout의 첫번째 인자인 콜백 함수가 호출된다.\
-- 끝\
\
위와 같은 사실로부터 몇가지 사실을 도출할 수 있다.\
\
첫번째, 렌더러 엔진 내부에서 렌더링 과정의 수행과 자바스크립트 코드 실행은 같은 스레드에서 수행된다.\
\
두번째, 마이크로테스크 큐의 실행은 렌더러 엔진의 스케줄링 과정에 포함되어 있지 않다.\
\
세번째, 자바스크립트 코드로 호출 가능한 WebAPI는 자바스크립트 엔진 내부에 구현되어 있지 않으며 렌더러 엔진에 구현되어 있다.\
\
따라서 WebAPI는 렌더러 엔진을 구현한 프로그래밍 언어로 실행된다. 크로미움의 경우 WebAPI는 C++ 코드로 실행된다.\
\
네번째, 이벤트 루프는 자바스크립트 코드를 수행하는 것을 포함하여 더 넒은 범위의 테스크를 포함한다.\
\
이러한 이벤트 루프는 렌더러의 메인 스레드 내부의 스케줄링 정책에 의해 수행된다.\
\
HTML Living Standard는 이벤트 루프를 다음과 같이 정의한다.\
\
```
To coordinate events, user interaction, scripts, rendering, networking, and so forth, user agents must use event loops as described in this section.\
Each agent has an associated event loop, which is unique to that agent.\
```
\
위의 문장을 해석하면 아래와 같다\
\
```
이벤트, 사용자와의 상호 작용, 스크립트의 실행, 화면 렌더링, 네트워킹 등을 조정하려면
유저 에이전트(웹 브라우저)는 이 절에 설명된 대로 이벤트 루프를 사용해야 한다.\
유저 에이전트는 각 에이전트 고유의 이벤트 루프를 가지고 있다.\
```
\
-- 참고 : whatwg.org