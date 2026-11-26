# Brassen Tower

주사위로 변하는 시련을 돌파하며 1,332층을 오르는 2.5D 액션 로그라이크입니다. 갈림길에서 다음 층에 적용할 효과를 고르고 5층마다 쉼터를 만납니다.

## 실행과 조작

이 폴더의 `index.html`을 브라우저에서 열 수 있습니다. 로컬 서버로 실행하려면 이 폴더에서 `python3 -m http.server 8000`을 실행하고 [localhost:8000](http://localhost:8000/)을 여세요.

| 동작 | 조작 |
| --- | --- |
| 이동 | WASD 또는 방향키 |
| 공격 | 스페이스 또는 마우스 왼쪽 클릭 |
| 회피 | Shift |
| 시설과 대화 상호작용 | E |

터치 화면에서는 게임 아래의 조작 버튼을 사용하세요. 진행 기록과 음악 설정은 사용 중인 브라우저의 사이트 저장소에 보관합니다.

## 소스와 배포

`index.html`은 화면 구조를, `styles.css`는 인터페이스를 정의합니다. `game.js`는 게임 진행을 맡고, `render.js`와 `title.js`는 배경과 캐릭터를 Canvas에 그립니다. 나머지 스크립트는 층과 보상, 성장, 이야기, 마을, 소리를 구성합니다.

HTML에서 CSS와 JavaScript를 상대 경로로 불러오는 정적 게임입니다. GitHub Pages에서 바로 배포하려면 **Settings → Pages**의 게시 원본을 **Deploy from a branch**로 두고 소스가 들어 있는 브랜치의 **/(root)**를 선택하세요. `.nojekyll`로 별도 빌드 없이 소스 파일을 게시합니다. [GitHub Pages 게시 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
