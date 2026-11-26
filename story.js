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
    inspection: {
      steps: [{ kind: "switch", device: "pump", label: "봉쇄기 전원 차단",
        task: "경비가 대피 통로를 잠갔습니다. 봉쇄기의 전원을 내리세요.", done: "봉쇄기가 멈추고 두 통로의 잠금이 풀렸습니다." }],
      task: "먼저 열 통로를 정하세요. 16층에서 그 길로 들어갑니다.",
      routes: { escort: ["relay", "환자 이동로 개방"], evidence: ["ledger", "검문 창고 개방"] },
      result: { escort: "환자 이동로가 열렸습니다. 16층에서 후송대와 합류합니다.",
        evidence: "검문 창고가 열렸습니다. 16층에서 경비가 압수한 문서를 찾습니다." },
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
    inspection: {
      art: "shelter", chapter: "1막 · 15층 봉쇄초소", title: "잠긴 대피로",
      device: "terminal", prompt: "봉쇄기 확인", choicePrompt: "다음 층의 어느 통로를 열까요?",
      beats: () => [terminal("봉쇄 제어기", "환자 이동로와 검문 창고가 경비 명령으로 봉쇄되었습니다.")],
      choices: [
        { id: "escort", title: "환자 이동로를 연다", description: "16층에서 후송대를 호위합니다.", effect: { ward: 12 } },
        { id: "evidence", title: "검문 창고를 연다", description: "16층에서 압수된 자료를 찾아냅니다.", effect: { gold: 15 } },
      ],
    },
    collapse: {
      art: "pressure", chapter: "2막 · 29층 붕괴선", title: "위로 가야 살아",
      device: "guard", prompt: "부상당한 경비에게 다가가기", choicePrompt: "경비의 마지막 열쇠로 어디를 열까요?",
      beats: () => [
        room("부상당한 경비", "난방이 꺼진 게 아니야. 밑에서부터 탑이 무너지고 있어."),
        player("그걸 알면서 대피로를 잠갔어요?"),
        room("부상당한 경비", "위쪽 좌석을 팔았어. 명단에 없는 사람은 아래에 남겨 두라는 명령이었고."),
        room("부상당한 경비", "살려면 위로 가. 30층 수동문까지는 이 열쇠로 열 수 있어."),
      ],
      choices: [
        { id: "alarm", title: "먼저 주민 대피를 알린다", description: "30층에서 경보기를 켜 비상 계단을 엽니다.", effect: { ward: 14 } },
        { id: "records", title: "대피 좌석 명단을 확보한다", description: "30층에서 명단 통을 회수해 안전한 보관함에 옮깁니다.", effect: { gold: 18 } },
      ],
    },
    ledger: {
      art: "pressure", chapter: "3막 · 329층 압력 기록실", title: "닫는 사람과 여는 사람",
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
      art: "memory", chapter: "4막 · 665층 전송실", title: "이번에는 전화를 받을 수 있다",
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
      art: "heart", chapter: "5막 · 1009층 인계실", title: "누가 다음 문을 여는가",
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
    10: {
      art: "shelter", chapter: "10층 · 성당", title: "문 앞의 명단",
      device: "guard", prompt: "성당의 문지기와 이야기하기",
      beats: ({ reservoir } = {}) => [
        room("성당 문지기", reservoir === "district" ? "아래 병실이 따뜻해졌다고 연락이 왔어요. 그래도 환자를 옮기라는 명령은 취소되지 않았어요."
          : reservoir === "reserve" ? "관문이 녹자마자 환자들이 출발했어요. 그런데 위쪽 문 앞에서 돌려보냈답니다."
            : "진료소 환자들이 위로 올라오다가 봉쇄초소에서 돌려보내졌어요."),
        player("빈 방은 있는데 왜 돌려보내죠?"),
        room("성당 문지기", "통과 명단에 이름이 없대요. 15층 봉쇄기가 환자 통로와 그 명단을 보관한 창고를 함께 잠그고 있어요."),
      ],
    },
    20: {
      id: "lower-gate-warning", art: "pressure", chapter: "20층 · 신전", title: "뒤에서 잠기는 문",
      device: "guard", prompt: "초소에서 내려온 경비와 이야기하기",
      beats: ({ inspection } = {}) => [
        room("초소 경비", inspection === "escort" ? "당신이 연 길로 환자들이 지나갔어요. 곧바로 그 길을 다시 잠그라는 명령이 떨어졌고요."
          : inspection === "evidence" ? "가져온 문서에 찍힌 발신부호를 알아요. 방금도 같은 사람이 하층 출구를 닫으라고 했어요."
            : "위층에서 하층으로 돌아가는 문을 모두 잠그라고 했어요. 아직 아래에 사람이 남았는데도요."),
        player("당신이 받은 명령은 어디서 왔죠?"),
        room("초소 경비", "29층입니다. 거기 당직병이 수동문 열쇠를 갖고 있어요. 지금 올라가지 않으면 그 사람도 입을 닫을 겁니다."),
      ],
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

  const fieldOperation = (floor, title, kind, device, label, task, done, extra) => ({
    scene: { art: "memory", chapter: floor + "층", title, device, prompt: label,
      beats: () => [room("등반가", task)] },
    operation: { steps: [{ kind, device, label, task, done, time: 1.65 }, ...(extra ? [extra] : [])] },
  });

  const operations = {
    7: ({ reservoir } = {}) => reservoir === "district"
      ? fieldOperation(7, "열이 닿은 병실", "switch", "valve", "진료소 환류 밸브",
        "진료소에 보낸 온수가 되돌아오고 있습니다. 환류 밸브를 열어 끊기지 않게 하세요.",
        "온수가 순환합니다. 아래 진료소에서 아이들 병실을 다시 열었습니다.")
      : fieldOperation(7, "관문 뒤에서 켜진 불", "switch", "relay", "환자 이동로 유도등",
        "차갑던 환자 이동로에 보조 전원이 들어왔습니다. 유도등을 켜 후송대를 부르세요.",
        "이동로를 밝혔습니다. 진료소는 후송대를 보냈지만, 15층에서 통과 허가를 내주지 않고 있습니다."),
    9: ({ reservoir } = {}) => fieldOperation(9, "주철 관문 안쪽", "switch", "valve", "관문 보조 손잡이",
      "관문 경비가 물러났습니다. 안쪽 손잡이로 남은 길을 여세요.",
      reservoir === "district" ? "관문이 열렸습니다. 진료소에 온수를 보내고도 수동 통로를 살려냈습니다."
        : "관문이 열렸습니다. 벽의 발급기에 새 통행 명단이 꽂혀 있습니다."),
    12: () => fieldOperation(12, "명단에 붙은 가격", "lift", "cartridge", "검문 발급기 원본 회수",
      "발급기가 원본을 내보냈습니다. 경비가 돌아오기 전에 가져가세요.", "발급기 원본을 들었습니다.",
      { kind: "fit", device: "ledger", label: "서로 다른 통행증 대조", task: "대조기에 원본을 넣고 환자 명단과 비교하세요.",
        done: "같은 자리가 두 번 팔렸습니다. 돈을 낸 이름만 최종 명단에 남았습니다." }),
    17: ({ inspection } = {}) => inspection === "escort"
      ? fieldOperation(17, "마지막 들것", "hold", "pressure", "후송문 열린 상태 유지",
        "후송대 마지막 들것이 아직 문 안쪽에 있습니다. 발판 위에 서서 문을 열어 두세요.",
        "마지막 들것이 지나갔습니다. 19층 초소가 통로를 다시 닫으려 합니다.")
      : fieldOperation(17, "위에서 온 도장", "switch", "relay", "압수 기록을 성당으로 송신",
        "검문 기록을 성당에 보내세요. 봉쇄 명령의 발신지가 찍혀 있습니다.",
        "성당이 사본을 받았습니다. 실제로 명령을 내린 곳은 19층 검문 회선보다 더 위입니다."),
    19: () => fieldOperation(19, "봉쇄 명령의 발신지", "switch", "relay", "검문 채널 도청",
      "경비가 쓰던 중계기의 봉인을 풀어 누가 폐쇄 명령을 냈는지 확인하세요.", "폐쇄 명령은 사고 신고 전에 내려왔습니다. 더 위에 있는 경비 초소에서 발신됐습니다."),
    30: ({ collapse }) => collapse === "records"
      ? fieldOperation(30, "대피 좌석 장부", "lift", "cartridge", "압수 명단 회수",
        "경비의 열쇠로 열린 함에서 대피 좌석 명단을 회수하세요.", "대피 좌석 명단을 들었습니다.",
        { kind: "fit", device: "ledger", label: "독립 보관함에 명단 보존", task: "경비가 지우기 전에 명단을 독립 보관함에 넣으세요.", done: "명단을 봉인했습니다. 판매 대금이 경비부 계좌로 흘러간 흔적이 남았습니다." })
      : fieldOperation(30, "비상 계단", "switch", "relay", "주민 대피 경보",
        "경비의 열쇠를 꽂아 경보기를 켜세요. 예비 회선이 비상 계단도 엽니다.", "경보가 울리고 비상 계단이 열렸습니다."),
    45: () => fieldOperation(45, "끌려 올라온 보급 상자", "lift", "cartridge", "대피소 의료품 확보",
      "무너진 짐칸의 의료품을 집어 안쪽 대피소까지 옮기세요.", "의료품을 들었습니다.",
      { kind: "fit", device: "relay", label: "대피소 리프트에 싣기", task: "의료품을 대피소 리프트에 넣으세요.", done: "리프트가 내려갑니다. 하층에서 올라온 사람들에게 의료품이 전달됩니다." }),
    75: () => fieldOperation(75, "먼저 떠난 엘리베이터", "switch", "pump", "급행 승강기 우선권 차단",
      "비어 있는 급행 승강기가 비상 계단의 전기를 빨아들이고 있습니다. 전력 우선권을 차단하세요.", "급행 승강기가 멈추고 비상 계단에 불이 켜졌습니다."),
    125: () => fieldOperation(125, "뿌리 아래의 지주", "hold", "pressure", "흔들리는 지주 받치기",
      "뿌리가 지지대를 밀어내고 있습니다. 바닥 받침을 눌러 후송 리프트가 지나갈 시간을 버세요.", "후송 리프트가 통과했습니다."),
    175: () => fieldOperation(175, "봉인된 피난선", "switch", "valve", "빈 객실 봉인 해제",
      "돈이 들어오기 전에는 빈 객실도 열지 못하게 잠갔습니다. 수동 밸브로 봉인을 푸세요.", "빈 객실이 열려 대피민을 태울 수 있게 됐습니다."),
    225: () => fieldOperation(225, "균열 측정추", "lift", "cartridge", "균열 센서 회수",
      "부러진 관측대에서 센서를 가져오세요.", "센서를 들었습니다.",
      { kind: "fit", device: "terminal", label: "센서를 대피망에 연결", task: "센서를 대피망에 연결해 붕괴 시작 위치를 대조하세요.", done: "압력 손실보다 먼저 암반이 꺾였습니다. 탑의 붕괴는 사고 신고보다 앞서 시작됐습니다." }),
    275: () => fieldOperation(275, "지워지는 명단", "switch", "pump", "청소 회로 차단",
      "대피 인원과 좌석 장부를 지우는 회로를 끊으세요.", "삭제가 멎었습니다. 같은 좌석이 몇 번이나 팔렸다는 흔적이 남았습니다."),
    330: ({ ledger }) => ledger === "public"
      ? fieldOperation(330, "공개 송신을 막는 차폐", "switch", "relay", "구역 공개 송신 복구",
        "경비가 장부 송신을 차단했습니다. 쉼터 송신기를 독립 회선으로 돌리세요.", "장부가 하층 광장의 수신기에 도착했습니다.")
      : fieldOperation(330, "당직자의 원본", "lift", "cartridge", "보호된 증언통 인수",
        "정비조가 따로 남긴 증언통을 받아 인수함으로 옮기세요.", "증언통을 들었습니다.",
        { kind: "fit", device: "ledger", label: "증언 보호함에 봉인", task: "증언통을 보호함에 넣어 이름부터 가리세요.", done: "증언이 봉인됐습니다. 정비조가 신원을 가린 채 내용을 검증할 수 있습니다." }),
    385: () => fieldOperation(385, "무너지는 기록 다리", "hold", "pressure", "기록 수레 건너보내기",
      "기록을 실은 수레가 지나갈 때까지 다리의 압력을 유지하세요.", "수레가 건넜습니다. 이제 기록 한 곳이 무너져도 증거가 남습니다."),
    445: () => fieldOperation(445, "없는 사람들의 신호", "switch", "relay", "삭제된 피난 신호 중계",
      "명단에서 지워진 구역의 조난 신호를 공용 회선으로 돌리세요.", "지워졌던 구역이 구조망에 다시 올라왔습니다."),
    505: () => fieldOperation(505, "비상 산소", "lift", "cartridge", "산소 셀 회수",
      "연기가 깔린 계단으로 산소 셀을 보내야 합니다.", "산소 셀을 들었습니다.",
      { kind: "fit", device: "pump", label: "비상 산소관에 연결", task: "산소 셀을 비상 산소관에 끼우세요.", done: "계단의 비상 산소관이 연결됐습니다." }),
    565: () => fieldOperation(565, "정지 명령의 대가", "switch", "terminal", "유료 통과 제한 해제",
      "구조요청을 막고 요금부터 받는 제한기를 해제하세요.", "요금 제한이 해제돼 구조대가 통과할 수 있습니다."),
    615: () => fieldOperation(615, "아직 살아 있는 호출", "hold", "pressure", "끊긴 회선 유지",
      "끊어지는 호출을 교환대까지 올릴 수 있게 접점을 붙잡으세요.", "호출이 위층 교환대로 넘어갔습니다."),
    725: () => fieldOperation(725, "낙하 방지틀", "switch", "valve", "대피 통로 고정 장치 작동",
      "옛 전송기가 바닥을 당기고 있습니다. 고정 장치로 대피 통로를 지탱하세요.", "통로가 고정됐습니다. 마지막 장비가 넘어올 수 있습니다."),
    785: () => fieldOperation(785, "돌아오는 길", "switch", "relay", "남은 생존자에게 길 밝히기",
      "돌아오는 구조대가 어둠 속에서 길을 놓치고 있습니다. 유도등을 켜세요.", "유도등이 켜졌습니다. 구조대가 신호를 따라옵니다."),
    855: () => fieldOperation(855, "벽 너머의 빛", "switch", "terminal", "차광 장치 개방",
      "탑 바깥에 있을 수 없는 빛이 새어 나옵니다. 차광 장치를 열어 방향을 확인하세요.", "빛은 탑 바깥이 아니라, 탑의 중심에서 하늘로 치솟고 있습니다."),
    915: () => fieldOperation(915, "가벼워진 잔해", "lift", "cartridge", "떠오른 돌 조각을 채집",
      "돌 조각들이 바닥에서 떠오릅니다. 채집통을 가져가세요.", "채집통을 들었습니다.",
      { kind: "fit", device: "terminal", label: "중력 계기에 표본 넣기", task: "계기에 표본을 넣어 방향을 확인하세요.", done: "돌은 무게를 잃은 게 아닙니다. 정상에 생겨나는 무언가에 끌려갑니다." }),
    965: () => fieldOperation(965, "누구를 태울 것인가", "switch", "ledger", "유료 승선표 폐기",
      "마지막 승선표 분배기가 여전히 좌석을 팔고 있습니다. 장치를 끄세요.", "남은 객실이 모든 생존자에게 개방됐습니다."),
    1010: ({ key }) => key === "districts"
      ? fieldOperation(1010, "구역의 인계 시험", "switch", "relay", "구역별 제어 회선 연결",
        "구역 대표들이 각자 문을 열 수 있도록 독립 회선을 연결하세요.", "구역별 인계가 끝났습니다. 중앙의 허가를 기다리지 않고 대피문을 열 수 있습니다.")
      : fieldOperation(1010, "중앙의 인계 시험", "hold", "pressure", "중앙 차단기 부하 유지",
        "정비조 차단기에 전원이 들어오는 동안 인계판을 밟아 압력을 유지하세요.", "중앙 차단기가 정비조에 연결됐습니다. 각 구역 계기판에도 압력이 표시됩니다."),
    1055: () => fieldOperation(1055, "배분 권한 시험", "hold", "pressure", "새 인계 회로 유지",
      "대피로를 통제하는 새 회로가 내려앉으려 합니다. 부하가 분산될 때까지 압력을 유지하세요.", "인계 회로가 안정됐습니다. 비상문을 이곳에서도 열 수 있습니다."),
    1105: () => fieldOperation(1105, "살아 있는 신호를 분리한다", "switch", "relay", "별 공명기와 대피망 분리",
      "정상에서 내려온 진동이 대피 회선을 삼키고 있습니다. 살아 있는 신호를 별도 회선으로 옮기세요.", "대피망이 분리됐습니다. 정상으로 가는 데 주민을 실어 보낼 필요가 없습니다."),
    1165: () => fieldOperation(1165, "새벽처럼 보이는 것", "switch", "terminal", "가짜 수평선 차폐 해제",
      "하늘 전체가 새벽처럼 빛납니다. 창을 가린 차폐를 열어 실제 발광원을 확인하세요.", "지평선 너머의 빛은 하나의 점에서 자라고 있습니다."),
    1225: () => fieldOperation(1225, "마지막 정박장", "hold", "pressure", "대피선 이탈 지원",
      "정박 고리가 끊기고 있습니다. 압력을 유지해 마지막 대피선이 빠져나가게 하세요.", "대피선이 탑에서 벗어났습니다. 정상에는 이제 등반가만 남았습니다."),
    1285: () => fieldOperation(1285, "별에 연결된 관", "switch", "valve", "생존 회선 최종 분리",
      "별로 이어진 관 하나가 아직 대피선을 향하고 있습니다. 수동 밸브를 잠그세요.", "대피선을 잡아당기던 흐름이 멎었습니다. 정상으로 이어지는 길이 열렸습니다."),
  };

  const starPrelude = {
    art: "star", chapter: "종장 · 1332층", title: "태어나지 않은 별",
    device: "terminal", prompt: "우주의 목소리",
    beats: () => [
      room("우주", "이건… 오직 새로운 별을 만들기 위한 시련이에요."),
      player("뭐…라고? 밑에서 무너진 사람들도 전부 시련이었다고요?"),
      room("우주", "탑은 별이 될 재료를 모았어요. 누굴 버리고 길을 막을지는 탑에 살던 사람들이 정했고요."),
      player("그럼 별을 만든다는 이유로, 이제 막 빠져나간 사람들까지 데려가겠다는 건 누구 결정이죠?"),
      room("우주", "별은 마지막 연료를 기다려요. 내 앞에 있는 산파가 그 생명들을 돌려주지 않을 거예요."),
      player("살아 있는 사람을 빼고도 태어날 수 있는지, 제가 알아보죠."),
    ],
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
      art: "epilogue", chapter: "종장 · 새 별 아래", title,
      device: "radio", prompt: "대피선 신호 받기",
      beats: () => [
        room("우주", "탑의 잔해만으로 불이 붙었어요. 저 별에는 누구도 갇혀 있지 않아요."),
        radio("진료소", "대피선에서도 보여요. 우린 여기 있어요."),
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

  window.TowerStory = { incidents, operations, scenes, interludes, shelterNotes, starPrelude, epilogue, cues };
})();
