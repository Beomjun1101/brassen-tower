(() => {
  "use strict";

  const radio = (speaker, line) => ({ speaker, line, tone: "radio", shot: "device" });
  const terminal = (speaker, line) => ({ speaker, line, tone: "terminal", shot: "device" });
  const player = (line) => ({ speaker: "등반가", line, tone: "player", shot: "player" });
  const room = (speaker, line) => ({ speaker, line, tone: "room", shot: "wide" });

  const incidents = {
    commission: {
      steps: [
        { kind: "lift", device: "cartridge", label: "예비 점화기", task: "진료소 난방이 멎었습니다. 배관 옆 예비 점화기를 챙기세요.", done: "점화기를 들었습니다." },
        { kind: "fit", device: "pump", label: "진료소 보일러", task: "점화기를 보일러에 끼우세요.", done: "보일러가 켜졌습니다. 남은 연료가 타기 시작합니다." },
      ],
      task: "보일러가 버티는 동안 어느 회선으로 도움을 요청할까요?",
      routes: { open: ["radio", "주민 회선 송신"], quiet: ["relay", "정비조 직통 회선 송신"] },
      result: { open: "주민들이 보호막을 보냈습니다. 수문으로 출발합니다.", quiet: "정비조가 비상 금화를 보냈습니다. 수문으로 출발합니다." },
    },
    reservoir: {
      steps: [
        { kind: "hold", device: "pressure", label: "압력판 · 2초", task: "온수가 새고 있습니다. 압력판 위에 서서 두 관을 먼저 안정시키세요.", done: "누출이 멎었습니다. 이제 한쪽 밸브를 열 수 있습니다.", time: 2 },
      ],
      task: "진료소와 관문 중 온수를 보낼 밸브를 여세요.",
      routes: { district: ["valve", "진료소 온수 밸브"], reserve: ["valve", "관문 전열 밸브"] },
      result: { district: "진료소 쪽 관으로 온수가 흐릅니다.", reserve: "온수가 관문 아래 전열관으로 흐릅니다." },
    },
    ledger: {
      steps: [
        { kind: "switch", device: "pump", label: "기록 소거기 차단", task: "소거기가 작동 중입니다. 전원을 내려 원본을 지키세요.", done: "소거기가 꺼졌습니다. 기록통이 배출됐습니다." },
        { kind: "lift", device: "cartridge", label: "원본 기록통 회수", task: "소거기 옆에 떨어진 원본 기록통을 회수하세요.", done: "기록통을 회수했습니다. 마지막 복귀 명령은 생산관 우선이었습니다." },
      ],
      task: "기록통을 공개 송신기에 넣거나 정비조 보관함에 맡기세요.",
      routes: { public: ["relay", "공개 송신기"], testimony: ["ledger", "정비조 보관함"] },
      result: { public: "생산관 우선 명령을 담은 원본이 구역 전체에 공개됐습니다.", testimony: "정비조가 원본을 인수했습니다. 당직자부터 불러 확인합니다." },
    },
    relay: {
      steps: [
        { kind: "lift", device: "cartridge", label: "교환대 예비 퓨즈", task: "교환대가 끊겼습니다. 예비 퓨즈를 챙기세요.", done: "퓨즈를 들었습니다." },
        { kind: "fit", device: "relay", label: "교환대 전원 복구", task: "예비 퓨즈를 교환대에 끼우세요.", done: "교환대가 켜졌습니다. 실시간 구조 호출이 들어옵니다." },
      ],
      task: "구조 회선을 먼저 연결하거나, 기록을 먼저 보존하세요.",
      routes: { rescue: ["radio", "구조 회선 연결"], archive: ["ledger", "정비 기록 복사"] },
      result: { rescue: "구조대가 연결됐습니다. 우회 과정에서 임시 정비 기록이 지워졌습니다.", archive: "정비 절차는 보존됐습니다. 구조 회선은 복사가 끝난 뒤 열립니다." },
    },
    key: {
      steps: [
        { kind: "switch", device: "pump", label: "자동 차단 회로 해제", task: "생산관으로만 흐르는 기존 회로를 먼저 끊으세요.", done: "기존 회로를 끊었습니다. 압력판에 전원이 들어왔습니다." },
        { kind: "hold", device: "pressure", label: "인계 압력판 · 1.8초", task: "인계 압력판 위에 서서 배분실의 압력을 맞추세요.", done: "배분실 회로가 열렸습니다. 담당자에게 권한을 보낼 수 있습니다.", time: 1.8 },
      ],
      task: "구역 대표 또는 중앙 정비조 인계 장치를 작동시키세요.",
      routes: { districts: ["relay", "구역 대표에 인계"], engineers: ["terminal", "중앙 정비조에 인계"] },
      result: { districts: "구역 대표들이 차단 권한을 나눠 가졌습니다.", engineers: "중앙 정비조가 차단 권한과 공동 점검표를 인수했습니다." },
    },
  };

  const scenes = {
    commission: {
      art: "prologue", chapter: "1막 · 식어가는 하층", title: "새벽까지 온수를",
      device: "radio", prompt: "진료소 무전 받기", choicePrompt: "수문으로 가기 전에 누구에게 알릴까요?",
      beats: () => [
        radio("진료소", "보일러가 멎었어요. 남은 연료로는 새벽까지만 버텨요."),
        radio("라온", "수문은 아직 수동으로 열 수 있어요. 거기서 끊긴 관을 따라가죠."),
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
      art: "shelter", chapter: "1막 · 5층 저수조", title: "한쪽 관만 열 수 있다",
      device: "valve", cue: "reservoir-lead", prompt: "저수조 밸브 확인", choicePrompt: "남은 온수를 어느 쪽으로 보낼까요?",
      beats: ({ commission } = {}) => [
        terminal("저수조 계기판", "비축량 부족. 진료소와 관문 전열 중 한 곳만 연결 가능."),
        commission === "open"
          ? radio("진료소", "병실 하나 더 열어도 될까요?")
          : radio("정비조", "관문이 얼면 수리조는 손으로 열어야 해요."),
        radio("라온", "진료소는 밤을 버텨야 하고, 수리조는 이 관문을 지나야 해요."),
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
      art: "pressure", chapter: "2막 · 329층 압력 기록실", title: "닫는 사람과 여는 사람",
      device: "ledger", cue: "ledger-lead", prompt: "사고 장부 열기", choicePrompt: "장부를 공개할까요, 당직자 이야기를 먼저 들을까요?",
      beats: ({ reservoir } = {}) => [
        terminal("압력 기록기", "하층 차단 승인: 라온. 압력 안정 뒤 재개 명령 없음."),
        radio("라온", "터진 관에서 사람을 빼려고 잠갔어요. 압력이 내려가면 다시 열기로 했고요."),
        reservoir === "district"
          ? radio("진료소", "보내 준 온수로 병실 하나를 열었어요.")
          : radio("정비조", "동파는 막았어요. 진료소는 아직 추워요."),
        terminal("압력 기록기", "기본 복귀 규칙 발동. 생산관 우선. 하층 공급 수동 승인 대기."),
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
      art: "memory", chapter: "3막 · 665층 전송실", title: "이번에는 전화를 받을 수 있다",
      device: "relay", cue: "relay-lead", prompt: "교환대 호출 듣기", choicePrompt: "구조 전화를 연결할까요, 기록을 먼저 복사할까요?",
      beats: ({ ledger } = {}) => [
        ledger === "public"
          ? radio("야간조", "장부를 대조하니 구조 호출 열두 건이 빠졌어요.")
          : radio("생존 정비공", "열두 번 걸었는데 구조대엔 안 닿았어요."),
        radio("하층 수리조", "지금도 한 명이 갇혀 있어요. 안쪽에선 도면을 받을 수 없어요."),
        terminal("전송 장치", "즉시 우회하면 미복구 정비 기록 소거. 복사 중에는 통화 연결 불가."),
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
      art: "heart", chapter: "4막 · 1009층 인계실", title: "다음 겨울의 당직표",
      device: "terminal", cue: "handoff-lead", prompt: "제어권 인계 확인", choicePrompt: "복구 후 비상 차단은 누가 맡을까요?",
      beats: ({ relay, ledger } = {}) => [
        terminal("인계 단말기", "재가동 준비 완료. 새 비상 차단 담당자를 지정하세요."),
        relay === "rescue"
          ? radio("구조대", "그 전화 덕에 마지막 작업자를 찾았어요.")
          : radio("라온", "그 기록대로면 밸브를 열어도 압력을 잡을 수 있어요."),
        ledger === "public"
          ? radio("구역 대표", "생산관이 먼저였던 규칙을 바꾸고 싶어요. 각 구역에서 우리 관을 볼 수 있게요.")
          : radio("야간조", "관이 터지면 압력이 어디로 쏠릴지 저희가 알아요. 대신 혼자 결정하는 일은 끝내야죠."),
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
    "sluice-open": ({ commission } = {}) => commission === "open"
      ? radio("주민", "수문 쪽 계량기가 움직여요. 진료소로 가는 펌프는 아직 꺼져 있어요.")
      : radio("정비조", "수문은 열렸어요. 진료소 쪽 펌프에 전원이 필요합니다."),
    "relay-cell": () => radio("라온", "계량기가 켜졌어요. 펌프를 돌릴 전원은 아직 부족해요."),
    "pressure-start": () => radio("라온", "펌프가 돌아요. 압력을 잡으면 5층 저수조에 닿을 수 있어요."),
    "reservoir-lead": () => radio("라온", "저수조에 온수가 남았어요. 진료소를 연결할게요."),
    frontier: () => radio("라온", "여기부터는 우리 쪽 지도가 없어요. 옛 설비는 아래에서 원격으로 돌렸대요."),
    "ledger-lead": () => radio("라온", "장부가 열렸어요. 제 이름부터 찾으세요."),
    "relay-lead": () => radio("야간조", "교환대에 들어가면 녹음과 실시간 통화가 따로 들릴 거예요."),
    "handoff-lead": () => radio("라온", "열쇠를 넘기기 전에 당직자를 정해야 해요."),
    "return-signal": () => radio("라온", "복귀 회선에 잡음이 줄었어요. 교환대에서 받아보세요."),
    "shift-signal": () => radio("야간조", "옛 근무표를 방금 읽을 수 있게 됐어요."),
    "heating-signal": () => radio("라온", "난방 중계기가 살아났어요. 아래에선 어느 관이 데워졌나 확인해 볼게요."),
    "test-signal": () => radio("라온", "시험 공급이 끝났어요. 하층 보고가 계기판에 도착했어요."),
    "handoff-signal": () => radio("라온", "배분실까지 한 구간 남았어요. 자동 차단기부터 확인해요."),
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
      device: "valve", prompt: "관문 계량기 확인", cue: "iron-gate-open", supply: "reservoir", optional: true,
      beats: (choices) => [cues["iron-gate-open"](choices), radio("라온", "수리조는 복귀 회선을 따라갈게요.")],
    },
    29: {
      art: "pressure", chapter: "29층 · 복귀 회선", title: "첫 통화",
      device: "relay", prompt: "복귀 회선 듣기", cue: "return-signal", optional: true,
      beats: () => [cues["return-line-open"](), radio("라온", "압력이 오르면 다시 잠겨요. 조절실로 가요.")],
    },
    35: {
      art: "pressure", chapter: "35층 · 미측량 구역", title: "사람이 남긴 마지막 표지",
      device: "terminal", prompt: "경계 표지 확인", cue: "frontier", optional: true,
      beats: () => [room("개척선 표지", "현장 정비 종료. 상층 원격 운전만 허용."),
        player("사람 발자국은 여기서 끝나는데, 안쪽에선 뭔가 나왔어요.")],
    },
    489: {
      art: "memory", chapter: "489층 · 점검실", title: "명단에 없는 교대",
      device: "ledger", prompt: "야간 근무표 읽기", cue: "shift-signal", optional: true,
      beats: (choices) => [cues["shift-log"](choices), terminal("하층 당직 메모", "교대 미완료 · 지하 점검 구간 인수 대기")],
    },
    829: {
      art: "memory", chapter: "829층 · 난방 중계기", title: "먼저 데워진 곳",
      device: "relay", prompt: "난방 중계기 확인", cue: "heating-signal", optional: true,
      beats: (choices) => [cues["heating-relay-open"](choices), radio("라온", "수리조가 쓰는 계단부터 녹일게요.")],
    },
    1199: {
      art: "heart", chapter: "1199층 · 상층 송수관", title: "시험 공급",
      device: "valve", prompt: "시험 공급 기록 확인", cue: "test-signal", optional: true,
      beats: (choices) => [cues["test-feed"](choices), terminal("하층 시험 일지", "공급 확인 · 비상 차단 담당자 기록")],
    },
    1329: {
      art: "heart", chapter: "1329층 · 자동 차단기", title: "마지막 인계",
      device: "terminal", prompt: "배분실 회선 받기", cue: "handoff-signal", optional: true,
      beats: () => [terminal("자동 차단기", "정지 확인. 배분실 연결. 하층 유량 0."),
        radio("진료소", "여기서도 바늘을 보고 있어요. 물이 돌면 바로 알려드릴게요.")],
    },
  };

  const note = (floor, title, prompt, device, beats) => ({
    art: "memory", chapter: floor + "층 · 정비 기록", title, prompt, device, beats, optional: true,
  });
  const shelterNotes = {
    20: note(20, "보온포 세 장", "진료소 소식 확인", "radio", ({ reservoir } = {}) => [
      reservoir === "district" ? radio("진료소", "보내 준 온수로 아이들 병실을 다시 열었어요.")
        : radio("진료소", "남은 세 사람은 난로 옆으로 옮겼어요. 회선이 열리면 바로 연락 주세요."),
    ]),
    95: note(95, "낡은 분배도", "배관 도면 확인", "ledger", () => [
      terminal("정비 도면", "한파 시 하층 난방관으로 유량 1/3 전환."),
      player("여기 표시가 긁혔어요. 나중에 붙인 판엔 생산관이 먼저라고 쓰여 있어요."),
    ]),
    190: note(190, "우회로가 막힌 날", "고장 일지 확인", "terminal", ({ reservoir } = {}) => [
      terminal("원격 계기판", "하층 우회 시험 실패. 차단 승인 번호는 압력 기록실에 보관."),
      reservoir === "district" ? radio("라온", "병실 쪽은 시간을 벌었어요. 다음에도 이 밸브에 기대게 해선 안 돼요.")
        : radio("정비조", "관문은 녹였지만 하층 펌프까지 열 수는 없었어요. 기록실에서 이유를 찾아요."),
    ]),
    275: note(275, "빈 승인란", "격리 회로 기록 확인", "terminal", () => [
      terminal("격리 회로", "차단 정상. 압력 정상. 재개 승인 없음."),
      radio("라온", "제가 잠근 밸브예요. 다시 열라는 지시가 왜 빠졌는지 기록실에서 확인해요."),
    ]),
    540: note(540, "지금 들어온 신호", "긴급 호출 기록 확인", "relay", ({ ledger } = {}) => [
      ledger === "public" ? radio("야간조", "공개 장부에 찍힌 번호로 또 전화가 왔어요. 이번 건 녹음이 아니에요.")
        : radio("생존 정비공", "제 증언에 나온 회선에서 방금 전화가 왔어요. 지금 누가 그 안에 있어요."),
    ]),
    765: note(765, "지도에 생긴 길", "하층 조치 결과 듣기", "radio", ({ relay } = {}) => [
      relay === "rescue" ? radio("구조대", "연결된 도면대로 진입했어요. 안쪽에서 응답이 옵니다.")
        : radio("정비조", "복구한 절차로 우회관을 열었어요. 구조대는 막힌 쪽을 계속 찾고 있습니다."),
    ]),
    1110: note(1110, "첫 시험 당직", "인계 확인서 읽기", "terminal", ({ key } = {}) => [
      key === "districts" ? radio("구역 대표", "우리 구역 밸브는 제가 맡았어요. 옆 구역과 닫는 순서를 맞추고 있어요.")
        : radio("야간조", "제어반을 인수했어요. 구역마다 한 사람씩 계기판을 보게 했습니다."),
    ]),
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
          : radio("야간조", "제어반은 우리가 맡아요. 다음 교대부터 구역 대표도 계기판을 읽습니다."),
        publicRecord
          ? radio("라온", "감독 자리에서 내려왔어요. 내일 청문회예요.")
          : radio("라온", "당직자들과 보고서에 함께 서명했어요."),
        rescued
          ? radio("구조대", "마지막 작업자도 교대 전에 돌아왔어요.")
          : radio("정비조", "그 사람은 돌아오지 못했어요. 복구한 도면에 막힌 점검로를 새로 표시했습니다."),
        heated
          ? radio("진료소", "첫날 온수 덕에 한파 내내 문을 열었어요.")
          : radio("진료소", "내년엔 저수조에 진료소 몫을 남긴대요."),
        witnessed
          ? room("주민", "새 안내판 아래에 이름을 새겼어요.")
          : player("공구는 다음 야간조를 위해 돌려놨어요."),
      ],
    };
  }

  window.TowerStory = { incidents, scenes, interludes, shelterNotes, epilogue, cues };
})();
