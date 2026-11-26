(() => {
  "use strict";

  const radio = (speaker, line) => ({ speaker, line, tone: "radio", shot: "device" });
  const terminal = (speaker, line) => ({ speaker, line, tone: "terminal", shot: "device" });
  const player = (line) => ({ speaker: "등반가", line, tone: "player", shot: "player" });
  const room = (speaker, line) => ({ speaker, line, tone: "room", shot: "wide" });

  const scenes = {
    commission: {
      art: "prologue", chapter: "하층 구역", title: "진료소의 배관이 식었다",
      device: "radio", prompt: "진료소 무전 받기", choicePrompt: "출발 소식을 누구에게 알릴까요?",
      beats: () => [
        radio("진료소", "배관이 식어서 병실 두 칸을 비웠어요."),
        radio("라온", "급수로는 경비대가 막고 있어요."),
        player("수문부터."),
      ],
      response: ({ commission }) => commission === "open"
        ? radio("주민", "수문까지 쓸 보호막을 보냈어요.")
        : radio("정비조", "비상 금화는 계단 입구에 뒀어요."),
      choices: [
        { id: "open", title: "주민에게 등반을 알린다", description: "주민들이 첫 시련에 쓸 보호막 16을 보탭니다.", effect: { ward: 16 } },
        { id: "quiet", title: "정비조에만 알리고 오른다", description: "정비조가 비상 금화 16을 지급합니다.", effect: { gold: 16 } },
      ],
    },
    reservoir: {
      art: "shelter", chapter: "5층 · 저수조", title: "남은 열의 행선지",
      device: "valve", prompt: "저수조 밸브 확인", choicePrompt: "남은 온수를 어느 쪽으로 보낼까요?",
      beats: ({ commission } = {}) => [
        terminal("저수조 계기판", "비축 온수 있음 · 진료소 / 비상 전열"),
        commission === "open"
          ? radio("진료소", "병실 하나 더 열어도 될까요?")
          : radio("정비조", "진료소 연료는 자정까지 버텨요."),
        radio("라온", "아래로 보내면 수리조는 연료통을 져야 해요."),
      ],
      response: ({ reservoir }) => reservoir === "district"
        ? radio("진료소", "관이 데워져요. 병실을 열게요.")
        : radio("정비조", "전열선이 붙었어요. 연료통은 두고 갑니다."),
      choices: [
        { id: "district", title: "진료소에 비축열을 보낸다", description: "돌아온 의료 비축분으로 최대 체력 +8.", effect: { stat: "maxHp", amount: 8 } },
        { id: "reserve", title: "상층 비상 설비를 유지한다", description: "설비가 다음 시련에 보호막 22를 공급합니다.", effect: { ward: 22 } },
      ],
    },
    ledger: {
      art: "pressure", chapter: "329층 · 압력 기록실", title: "사흘 동안 닫혀 있던 밸브",
      device: "ledger", prompt: "사고 장부 열기", choicePrompt: "장부를 공개할까요, 당직자 이야기를 먼저 들을까요?",
      beats: ({ reservoir } = {}) => [
        terminal("압력 기록기", "진료소 밸브 폐쇄 · 승인 라온 · 인수 없음"),
        radio("라온", "터진 관 옆에 작업자가 셋 있었어요."),
        reservoir === "district"
          ? radio("진료소", "보내 준 온수로 병실 하나를 열었어요.")
          : radio("정비조", "동파는 막았어요. 진료소는 아직 추워요."),
        radio("구역 대표", "작업자들이 나온 뒤엔 누가 맡았죠?"),
      ],
      response: ({ ledger }) => ledger === "public"
        ? radio("구역 대표", "장부를 구역 게시판에 걸었어요.")
        : radio("생존 정비공", "녹음 켜 주세요. 제가 그 당직자예요."),
      choices: [
        { id: "public", title: "사고 기록을 구역 전체에 송신한다", description: "공개 기록을 검산하며 경험치 +45.", effect: { xp: 45 } },
        { id: "testimony", title: "현장 정비조의 증언을 먼저 모은다", description: "정비조가 증언과 함께 금화 24를 전달합니다.", effect: { gold: 24 } },
      ],
    },
    relay: {
      art: "memory", chapter: "665층 · 전송실", title: "받지 못한 호출",
      device: "relay", prompt: "교환대 호출 듣기", choicePrompt: "구조 전화를 연결할까요, 기록을 먼저 복사할까요?",
      beats: ({ ledger } = {}) => [
        ledger === "public"
          ? radio("야간조", "장부를 대조하니 구조 호출 열두 건이 빠졌어요.")
          : radio("생존 정비공", "열두 번 걸었는데 구조대엔 안 닿았어요."),
        terminal("전송 장치", "우회 연결 시 임시 기록 소거"),
        radio("라온", "복사하는 동안 구조대는 도면 없이 찾아야 해요."),
      ],
      response: ({ relay }) => relay === "rescue"
        ? radio("구조대", "연결됐어요. 지하 점검로로 갑니다.")
        : terminal("전송 장치", "하층 기록 복사 완료. 구조 회선 우회 연결 대기."),
      choices: [
        { id: "rescue", title: "구조 회선을 먼저 살린다", description: "구조대가 다음 시련에 보호막 32를 공급합니다.", effect: { ward: 32 } },
        { id: "archive", title: "사고 원인과 수리 절차를 보존한다", description: "정비 장치를 개선해 공격력 +4.", effect: { stat: "damage", amount: 4 } },
      ],
    },
    key: {
      art: "heart", chapter: "1009층 · 인계실", title: "다음 겨울의 당직표",
      device: "terminal", prompt: "제어권 인계 확인", choicePrompt: "복구 후 비상 차단은 누가 맡을까요?",
      beats: ({ relay, ledger } = {}) => [
        terminal("인계 단말기", "배분실 도면 열림 · 차단 권한 인계 대기"),
        relay === "rescue"
          ? radio("구조대", "그 전화 덕에 마지막 작업자를 찾았어요.")
          : radio("라온", "그 기록대로면 밸브를 열어도 압력을 잡을 수 있어요."),
        ledger === "public"
          ? radio("구역 대표", "누가 왜 잠그는지 우리도 봐야죠.")
          : radio("야간조", "밤에 관이 터지면 누가 먼저 잠급니까?"),
      ],
      response: ({ key }) => key === "districts"
        ? radio("구역 대표", "구역마다 공동 당직표에 서명하고 있어요.")
        : radio("야간조", "첫 점검엔 구역 대표들도 부를게요."),
      choices: [
        { id: "districts", title: "구역 대표가 제어권을 나누게 한다", description: "공동 설비가 다음 시련에 보호막 38을 공급합니다.", effect: { ward: 38 } },
        { id: "engineers", title: "정비조에 중앙 제어권을 위임한다", description: "정비조가 다음 시련 공격력을 18 높입니다.", effect: { overclock: 18 } },
      ],
    },
  };

  const cues = {
    "sluice-open": () => radio("라온", "급수로 압력이 돌아왔어요. 다음은 전원이에요."),
    "relay-cell": () => radio("라온", "전력 셀 하나 잡혔어요. 두 개 더 연결해요."),
    "pressure-start": () => radio("라온", "전원 들어왔어요. 위층 밸브에서 압력을 잡아요."),
    "reservoir-lead": () => radio("라온", "저수조에 온수가 남았어요. 진료소를 연결할게요."),
    frontier: () => radio("라온", "35층부터는 사람이 올라간 기록이 없어요."),
    "ledger-lead": () => radio("라온", "장부가 열렸어요. 제 이름부터 찾으세요."),
    "relay-lead": () => radio("야간조", "끊겼던 구조 호출이 넘어옵니다."),
    "handoff-lead": () => radio("라온", "열쇠를 넘기기 전에 당직자를 정해야 해요."),
    "iron-gate-open": ({ reservoir } = {}) => reservoir === "district"
      ? radio("진료소", "아래 계량기가 움직여요. 밤새 멈춰 있던 바늘이요.")
      : radio("정비조", "비축 온수로 관문의 얼음을 녹였어요."),
    "return-line-open": () => radio("진료소", "연결됐어요. 시험 온수 받을게요."),
    "shift-log": ({ ledger } = {}) => ledger === "public"
      ? radio("야간조", "빠진 교대 명단이에요. 연락이 끊긴 사람들이죠.")
      : radio("야간조", "이름은 빼 주세요. 빈칸은 연락이 끊긴 자리예요."),
    "heating-relay-open": ({ relay } = {}) => relay === "rescue"
      ? radio("구조대", "하층 점검로에서 한 분 찾았어요.")
      : radio("정비조", "그 절차로 하층 배관 두 줄을 열었어요."),
    "test-feed": ({ key } = {}) => key === "districts"
      ? radio("구역 대표", "시험 밸브는 구역마다 하나씩 열게요.")
      : radio("야간조", "가장 오래 식었던 구역부터 열었어요."),
    "final-lead": () => radio("라온", "진료소가 듣고 있어요. 공급 밸브를 열어요."),
  };

  const interludes = {
    9: {
      art: "pressure", chapter: "9층 · 주철 관문", title: "물이 한 층 더 오른다",
      device: "valve", prompt: "관문 계량기 확인", cue: "iron-gate-open",
      beats: (choices) => [cues["iron-gate-open"](choices), radio("라온", "수리조는 복귀 회선을 따라갈게요.")],
    },
    29: {
      art: "pressure", chapter: "29층 · 복귀 회선", title: "첫 통화",
      device: "relay", prompt: "복귀 회선 듣기", cue: "return-line-open",
      beats: () => [cues["return-line-open"](), radio("라온", "압력이 오르면 다시 잠겨요. 조절실로 가요.")],
    },
    35: {
      art: "pressure", chapter: "35층 · 미측량 구역", title: "사람이 남긴 마지막 표지",
      device: "terminal", prompt: "경계 표지 확인", cue: "frontier",
      beats: () => [room("개척선 표지", "정비 통행 종료 · 35층부터 미측량"),
        cues.frontier(), player("먼지에 발톱 자국이 있어요.")],
    },
    489: {
      art: "memory", chapter: "489층 · 점검실", title: "명단에 없는 교대",
      device: "ledger", prompt: "야간 근무표 읽기", cue: "shift-log",
      beats: (choices) => [cues["shift-log"](choices), terminal("하층 당직 메모", "교대 미완료 · 지하 점검 구간 인수 대기")],
    },
    829: {
      art: "memory", chapter: "829층 · 난방 중계기", title: "먼저 데워진 곳",
      device: "relay", prompt: "난방 중계기 확인", cue: "heating-relay-open",
      beats: (choices) => [cues["heating-relay-open"](choices), radio("라온", "수리조가 쓰는 계단부터 녹일게요.")],
    },
    1199: {
      art: "heart", chapter: "1199층 · 상층 송수관", title: "시험 공급",
      device: "valve", prompt: "시험 공급 기록 확인", cue: "test-feed",
      beats: (choices) => [cues["test-feed"](choices), terminal("하층 시험 일지", "공급 확인 · 비상 차단 담당자 기록")],
    },
    1329: {
      art: "heart", chapter: "1329층 · 자동 차단기", title: "마지막 인계",
      device: "terminal", prompt: "배분실 회선 받기", cue: "final-lead",
      beats: () => [terminal("자동 차단기", "정지 · 배분실 연결 · 하층 유량 영"), cues["final-lead"](),
        radio("진료소", "물이 돌면 무전할게요.")],
    },
  };

  function epilogue(choices = {}) {
    const districts = choices.key === "districts";
    const publicRecord = choices.ledger === "public";
    const rescued = choices.relay === "rescue";
    const heated = choices.reservoir === "district";
    const witnessed = choices.commission === "open";
    const title = districts
      ? publicRecord ? "광장의 계기판" : "다섯 개의 열쇠"
      : publicRecord ? "유리벽 제어실" : "야간 정비조";
    return {
      art: "epilogue", chapter: "종장 · 다시 흐르는 열", title,
      device: "radio", prompt: "진료소 응답 듣기",
      beats: () => [
        radio("진료소", "관에 물 돌아요. 밸브를 놓으세요."),
        districts
          ? radio("구역 대표", "구역마다 차단 열쇠를 맡았어요.")
          : radio("야간조", "비상 차단은 저희가 맡고 점검은 함께합니다."),
        publicRecord
          ? radio("라온", "감독 자리에서 내려왔어요. 내일 청문회예요.")
          : radio("라온", "당직자들과 보고서에 함께 서명했어요."),
        rescued
          ? radio("구조대", "마지막 작업자도 교대 전에 돌아왔어요.")
          : radio("정비조", "못 찾은 작업자의 호출은 기념실에 남겼어요."),
        heated
          ? radio("진료소", "첫날 온수 덕에 한파 내내 문을 열었어요.")
          : radio("진료소", "내년엔 저수조에 진료소 몫을 남긴대요."),
        witnessed
          ? room("주민", "새 안내판 아래에 이름을 새겼어요.")
          : player("공구는 다음 야간조를 위해 돌려놨어요."),
      ],
    };
  }

  window.TowerStory = { scenes, interludes, epilogue, cues };
})();
