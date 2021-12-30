### 크로미움에서 requestAnimationFrame이 수행되는 과정

( 최종수정일 : 2021년 5월 3일 AM 9:29)


requestAnimationFrame 함수 줄여서 rAF를 이해하려면 rAF가 만들어진 배경을 이해하는 것이 좋다.


rAF가 존재하기 전 웹페이지에서 매끄러운 애니메이션을 구현할 때는 setInterval 함수에 의존해야 했다.

하지만 setInterval 함수는 크게 3가지 문제가 존재했다.


첫째로 이 함수는 5회 이상 반복되는 주기부터 정밀도가 최소 4ms로 강제 조정된다.

유저가 setInterval의 timeout주기를 1ms로 설정한다 하여도 5회 이상 반복되는 시점부터는 4ms로 강제 조정된다. 이를 타이머의 클램핑 기능이라고 한다.

이는 WHATWG HTML Living Standard에 명시되어 있다


﻿If nesting level is greater than 5, and timeout is less than 4, then set timeout to 4.
내용을 입력하세요.
< 참고 : https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval >


그리고 이러한 명세는 크로미움에 반영되어 있다


﻿
// Step 11 of the algorithm at

// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html requires

// that a timeout less than 4ms is increased to 4ms when the nesting level is

// greater than 5.

constexpr int kMaxTimerNestingLevel = 5;

constexpr base::TimeDelta kMinimumInterval = base::TimeDelta::FromMilliseconds(4);
내용을 입력하세요.
< 참고 : third_party/blink/renderer/core/frame/dom_timer.cc >


이러한 조치는 setInterval 함수보다 낮은 우선순위를 가진 테스크들의 기아 상태를 방지하기 위하여 고안되었다.

이러한 클램핑 기능은 기아 상태를 방지하는 차원에서는 효율적이지만 정밀한 타이머를 구현하는 데는 방해거리가 된다.


두번째 문제 역시 정밀도 문제인데, setInterval의 두번째 인자인 timeout은 소수점 이하를 무시하고 정수로 해석된다.

예를 들어서 60프레임을 구현하려는 의도로 1초를 60으로 나눈 16.666ms 를 setInterval의 timeout 인자로 넣는다 하더라도 실제 작동시에는 16ms로 인식된다.

자바스크립트 코드 상에서 에러 메시지를 내뱉지는 않지만 블링크 엔진 내부에서는 소수점 이하가 무시된 값인 16으로 인자값을 받게 되기 때문이다.

그 이유는 setInterval의 구현체의 timeout 인자 타입이 int이기 때문이다.

다음은 setTimeout 구현체의 매개변수별 타입이다.


﻿
int WindowOrWorkerGlobalScope::setInterval(

    ScriptState* script_state,

    EventTarget& event_target,

    V8Function* handler,

    int timeout,

    const HeapVector<ScriptValue>& arguments)

﻿
내용을 입력하세요.
< 참고 : third_party/blink/renderer/core/frame/window_or_worker_global_scope.cc >


위에서 4번째 값이 setTimeout의 두번째 인자인 timeout 값이다.

이처럼 소수점이 무시되기 때문에 1ms 미만의 정밀도를 제어할 수 없다.


세번째로 setInterval 함수는 모니터의 주사율에 근거하여 프레임을 갱신할 수가 없다.

rAF가 재정되기 이전의 대부분의 모니터는 주사율이 60Hz로 고정되어 있었다. 하지만 최근 출시되는 모니터는 75Hz, 120Hz, 144Hz, 240Hz로 주사율이 다양하다.

가령 매끄러운 애니메이션을 위해 60프레임을 염두해 두고 16.66ms 단위로 화면을 갱신하기로 했다고 가정해 보자. 이 경우 코드는 아래와 같이 된다.

setInterval(animateFunction, 17) ; // 두번째 매개변수의 소수점 이하를 무시하기 때문에 16.66을 반올림한 값을 대입한다

위의 함수를 실행할 경우 가장 이상적인 시나리오대로 60프레임이 구현된다고 하더라도 주사율이 60Hz을 초과하는 모니터에서 그 이상의 프레임을 보장하기 어렵다.

그렇다고 240Hz에 맞추어 4.16ms 단위로 화면을 갱신한다면 240hz미만의 모니터에서는 자원의 낭비가 심해진다.

결국 모니터 주사율에 적응적으로 변화하는 갱신은 setInterval 함수로 해결할 수 없다.


이와 같은 문제로 인하여 더욱 정밀한 프레임 갱신 방법론에 대한 요구가 있었고 그 결과로 requestAnimationFrame 함수가 탄생하였다.

requestAnimationFrame 은 위의 3가지 문제를 처리해 준다. 즉 다음과 같다.

첫째로 타이머 수치가 임의로 클램핑되지 않는다.

둘째로 정밀도를 나노초 단위로 제어가 가능하다.

셋째로 모니터의 주사율에 근거하여 프레임을 갱신할 수 있다.


모니터의 주사율에 근거하여 프레임이 가변적으로 갱신된다는 점은 흥미롭다. 실제로 그렇게 작동하는지 직접 확인해 보겠다.



<html>
   <body>
      <script>
         (()=>{
         	let prev = performance.now() ;
         	let cnt = 0 ; 
         	function animateFunc(){
         
         		let curr = performance.now() ;
         		console.log(`${curr - prev} ms`) ; 
         		prev = curr ; 
         		
         		if(++cnt < 100) {
         			requestAnimationFrame(animateFunc) ; 
         		}	
         	}
         	requestAnimationFrame(animateFunc); 
         })()         
      </script>
   </body>
</html>
내용을 입력하세요.
위의 코드는 rAF를 반복 호출한다. 그리고 이전에 호출된 rAF 콜백함수와의 인터벌을 console.log로 출력한다

위의 코드를 먼저 아래의 60Hz 모니터에서 실행해 보았다



사진 삭제
사진 설명을 입력하세요.

결과는 아래와 같다



사진 삭제
사진 설명을 입력하세요.

값은 대체로 16.6ms에 근사한 값을 보여준다. 사실 실행한 컴퓨터의 CPU 성능이 좋지 않아서 오차가 비교적 크게 발생하였다. 이 오차는 단일 프로세서의 처리 속도가 빠를수록 감소한다.


장비를 바꾸어서 144Hz 모니터에서 같은 코드를 수행하였다.



사진 삭제
사진 설명을 입력하세요.

결과는 아래와 같다



사진 삭제
사진 설명을 입력하세요.

144Hz는 1초에 144회 화면을 갱신하므로 1프레임이 갱신되는 주기는 약 6.94ms이다.

위의 수치는 약 6.94ms에 근사한 수치를 보여준다. 각 프레임별로 오차가 적은 이유는 CPU의 성능이 앞선 60Hz 테스트에서 사용한 CPU보다 빠르기 때문이다.



이처럼 모니터 주사율에 가변적으로 rAF 호출 주기가 변경되는 이유는 rAF 함수가 모니터에서 제공하는 vsync pulse를 기반으로 작동하기 때문이다.


vertical sync pulse, 줄여서 vsync pulse는 모니터에서 제공하는 전기적 신호인데 이 신호는 모니터가 화면상에 새로운 픽셀을 뿌리는 주기와 연관이 있다.

모니터는 화면상에 새로운 픽셀을 드로잉하고 다음번 픽셀의 드로잉을 준비하기 시작할 때 vertical sync pulse를 생성한다. 예를 들어 60Hz 주사율의 모니터는 1초에 60번 새로운 화면을 갱신하는데 이 갱신 주기는 일정하다. 따라서 1초를 60으로 나눈값인 16.66ms 간격으로 vsync pulse를 생성한다.

이 전기적 신호는 그래픽카드가 감지할 수 있다. 이 감지된 신호를 기반으로 requestAnimationFrame의 콜백함수가 호출되기 때문에 타이머 수치가 클램핑되지 않고, 나노세컨드 단위로 정밀하며, 모니터의 주사율에 근거하여 프레임을 갱신할 수 있다.


이러한 프로세스가 구체적으로 어떻게 구현되어 있을지 추측해 보자.

크로미움에서는 탭을 하나 생성할 때 마다 렌더러 프로세스가 한개씩 생성된다. 각 탭은 하나의 렌더러 프로세스를 가지고 있다.

이 렌더러 프로세스는 탭 안에 보이는 화면을 렌더링하는 역할을 수행한다.

그러니 이 렌더러 프로세스 내부에 vsync pulse를 감지하는 스레드가 존재한다고 생각할 수 있다.

vsync 스레드가 vsync를 감지하여 자바스크립트를 실행하는 메인 스레드에게 신호를 전파하고 이 신호를 받은 메인 스레드가 requestAnimationFrame의 콜백함수를 호출하는 방식으로 수행된다고 생각할 수 있다.

그러나 렌더러 프로세스는 샌드박스화 되어 있으므로 vsync 신호를 보내는 gpu 디바이스에 직접 억세스할 수 없다.

샌드박스란 일종의 제한된 환경이며 샌드박스 안에 존재하는 프로세스는 CPU와 메모리를 제외한 다른 리소스에 접근할 수 없다.

따라서 렌더러 프로세스는 샌드박스 환경 밖에 있는 GPU 프로세스와의 IPC를 통하여 vsync신호를 전달받게 된다. 도식화하면 아래와 같다




사진 삭제
사진 설명을 입력하세요.

크로미움 브라우저 내부의 GPU 프로세스는 vsync 스레드를 가지고 있다. 이 스레드는 OS가 제공하는 vsync API를 이용하여 vsync 주기를 감지한다.

예를들어 windows OS의 경우 vsync API는 IDXGIOutput 클래스가 제공하는데 이 클래스가 제공하는 waitForVBlank 등의 메소드를 사용하여 vsync 주기를 감지한다. 아래 코드는 windows용 vsync 스레드가 v싱크 신호 감지에 사용하는 메소드이다.


void VSyncThreadWin::WaitForVSync() {

  // .. 생략
  const HMONITOR monitor = MonitorFromWindow(nullptr, MONITOR_DEFAULTTOPRIMARY);

  if (primary_monitor_ != monitor) {
    primary_monitor_ = monitor;
    primary_output_ = DXGIOutputFromMonitor(monitor, d3d11_device_);
  }

  // .. 생략

  const bool wait_for_vblank_succeeded =
      primary_output_ && SUCCEEDED(primary_output_->WaitForVBlank());

  // .. 생략

  if (!wait_for_vblank_succeeded ||
      wait_for_vblank_elapsed_time < kVBlankIntervalThreshold) {
    Sleep(static_cast<DWORD>(vsync_interval.InMillisecondsRoundedUp()));
  }

  // .. 생략

  if (!observers_.empty()) {
    vsync_thread_.task_runner()->PostTask(
        FROM_HERE,
        base::BindOnce(&VSyncThreadWin::WaitForVSync, base::Unretained(this)));
    const base::TimeTicks vsync_time = base::TimeTicks::Now();
    for (auto* obs : observers_)
      obs->OnVSync(vsync_time, vsync_interval);
  } else {
    is_idle_ = true;
  }
}
내용을 입력하세요.
< 참조 : ui/gl/vsync_thread_win.cc>


위의 코드에서 DXGIOutputFromMonitor함수는 프라이머리로 사용중인 모니터의 정보를 가져온다. 그리고 해당 모니터를 대상으로

WaitForVBlank 메소드를 호출하여 v싱크 주기를 감시한다. 만일 v싱크 주기가 감지된다면 옵저버인 DirectCompositionChildSurfaceWin 클래스의 OnVSync 메소드가 트리거되고 프레임 생성 파이프라인을 시작한다. 이 파이프라인의 시작신호를 BeginFrame이라고 한다.

크로미움은 BeginFrame을 다음과 같이 정의하고 있다


BeginFrame is the mechanism that tells us that now is a good time to start making a frame

-> BeginFrame은 메커니즘인데 이 메커니즘은 지금이 프레임의 생성을 시작하는 좋은 타이밍이라는 것을 알려준다.
내용을 입력하세요.
< 출처 : cc/scheduler/scheduler.cc >


GPU 프로세스는 렌더러 프로세스에게 BeginFrame 신호를 보낸다. 이 때 BeginFrame은 하나의 테스크로서 간주되며 스케줄러에 의해 스케줄링된다. 이 BeginFrame 신호는 렌더러 프로세스의 impl 스레드에게 전달된다.

사실 렌더러 프로세스에는 크게 2가지의 스레드가 존재한다. 메인스레드와 impl 스레드가 그것인데 각각의 스레드는 별도의 스케줄러를 가지고 있다.

GPU 프로세서로부터 전달받는 BeginFrame 신호는 impl 스레드가 전달받으며 impl 스레드의 스케줄러에 의해 스케줄링된다. 이때 스케줄링되는 테스크는 impl 스레드에서 수행하는 BeginFrame이라는 의미에서 BeginImplFrame이라고 부른다. BeginImplFrame 테스크가 수행되는 시점에서 impl 스레드는 프레임 생산이 시작되었음을 인지한다.

impl 스레드는 BeginImplFrame 테스크의 수행도중 메인 스레드에게 BeginMainFrame 테스크를 수행하라는 메시지를 전송한다. 이 테스크를 수행하는 시점에서 메인 스레드는 프레임 생산이 시작되었음을 인지한다.

지금까지의 과정을 요약하면 아래와 같다



사진 삭제
사진 설명을 입력하세요.

위의 과정은 매우 간략화된 형태이지만 사실 BeginMainFrame은 메인스레드의 이벤트 루프 내부에서 테스크의 형태로 실행된다.

여기까지 이 글을 읽은 독자라면 이벤트 루프가 여러개의 테스크 큐를 대상으로 우선순위에 기반하여 수행된다는 사실을 알고있을 것이다.

따라서 BeginMainFrame 또한 작업이 실행되기 전까지 특정한 테스크 큐에 저장되어 있다가 해당 테스크 큐의 순서가 오면 dequeue되어 수행된다. BeginMainFrame은 작업이 수행되기 전까지 컴포지터 테스크 큐에 저장된다.


이 BeginMainFrame 테스크가 메인스레드 내부에서 하는 일을 요약하면 아래와 같다.

가장 먼저 유저 입력에 대한 이벤트리스너를 수행한다. 이 과정에서 DOM 트리 또는 CSSOM 트리가 변경될 수 있다.

곧이어 requestAnimationFrame의 콜백함수가 스케줄러에 등록되어 있다면 해당 함수를 실행한다. 이 과정에서 DOM 트리 또는 CSSOM 트리가 변경될 수 있다.

이 시점에서 rAF 콜백함수가 종료되지만 변경사항이 바로 모니터에 적용되는 것은 아니며 모니터의 갱신까지는 몇가지 추가 단계를 필요로 한다.

rAF의 종료이후 LocalFrameView 클래스의 UpdateLifeCycle 메소드를 수행한다. 이 테스크는 페이지의 최종 변경사항을 레이아웃 트리에 적용시킨다. 이 레이아웃 트리의 변경사항은 최종적으로 레이어 트리와 프로퍼티 트리를 생성한다.


변경사항의 반영이 종료되면 레이어 트리의 커밋을 수행할 준비가 되었다는 신호인 NotifyReadyToCommit를 impl 스레드에게 전송한다. 이 메시지의 전송작업은 메인스레드의 프록시 클래스인 ProxyMain이 수행한다. 이 때 impl 스레드에게 뮤텍스를 보내며 메인 스레드는 블록킹 상태에 빠진다. 메인스레드가 블록킹 상태에 빠지는 이유는 impl 스레드가 레이어 트리를 복제하는 작업이 완료되기 전 까지는 레이어 트리를 수정해선 안되기 때문이다.

여기까지가 메인스레드의 렌더링 작업이고 이후의 작업은 impl 스레드가 수행한다.


NotifyReadyToCommit 신호를 전달받은 impl 스레드가 커밋 준비를 마친다면 ProxyImpl 클래스를 이용하여 메인 스레드의 데이터를 복제하여 컴포지터 스레드만이 접근할 수 있는 데이터를 생성한다. 만일 이러한 복제물을 생성하지 않은 채 메인스레드와 impl 스레드가 레이어 트리를 공유하여 사용한다면 메인스레드에서 변경작업 중인 레이어 트리의 변경작업이 완료되기도 전에 impl 스레드 측에서 임의로 디스플레이에 출력하는 사태가 발생할 수 있다. 이 경우 모니터의 티어링 현상이 발생할 수 있다.


레이어 트리의 복제 작업이 완료되면 impl 스레드가 데이터의 복제가 완료되었다는 신호를 메인 스레드에게 건내주고 메인스레드는 블록킹 상태에서 벗어나 테스크를 재개할 수 있게된다. impl 스레드는 복제된 데이터를 기반으로 컴포지팅 작업을 수행한다. 컴포지팅은 화면상에 출력될 비트맵을 생성하는 작업이다. 비트맵의 생성이 완료되면 GPU 프로세스가 드로잉 작업을 수행하고 최종 결과물이 모니터에 드로잉된다.


여기까지가 프레임생성의 풀 파이프라인이고 rAF의 콜백함수는 이러한 프레임 생성의 전체 파이프라인 중 BeginMainFrame 테스크의 일부분으로서 실행된다. 위의 설명은 전체 파이프라인을 매우 축약한 것이며 실제 과정은 더욱 디테일하다. 본 문서는 풀 파이프라인 중 rAF가 실행되는 과정에 집중하여 작성되었다.


참고

Youtube - Life of a pixel (Chrome University 2019)

웹사이트 : Chromium Code Search

크로미움 문서 : How cc Works

크로미움 문서 : Blink Scheduler





