//=============================================================================
// YourTurnBanner.js
//=============================================================================

/*~struct~IntroSwitchSet:
 * @param switchId
 * @text 스위치 ID
 * @type switch
 * @default 0
 * @desc 이 스위치가 켜져 있으면 이 세트를 사용합니다. 목록에서 위에
 * 있는 항목일수록 우선순위가 높습니다.
 *
 * @param image1
 * @text 그림 1 (왼쪽 등장)
 * @type text
 * @default
 * @desc 비워두면 기본 Intro Image 1을 사용합니다.
 *
 * @param image2
 * @text 그림 2 (오른쪽 등장)
 * @type text
 * @default
 * @desc 비워두면 기본 Intro Image 2을 사용합니다.
 *
 * @param image3
 * @text 그림 3 (왼쪽 등장)
 * @type text
 * @default
 * @desc 비워두면 기본 Intro Image 3을 사용합니다.
 *
 * @param image4
 * @text 그림 4 (오른쪽 등장)
 * @type text
 * @default
 * @desc 비워두면 기본 Intro Image 4을 사용합니다.
 */

/*~struct~ActorImage:
 * @param actorId
 * @text 액터
 * @type actor
 * @default 0
 *
 * @param slot
 * @text 파티 위치 (선택)
 * @type text
 * @default
 * @desc 1~4. 이 액터가 이 위치(순서)에 있을 때만 적용. 비워두면 위치
 * 상관없이 적용됩니다. 위치 지정 항목이 비워둔 항목보다 우선합니다.
 *
 * @param image
 * @text 이 액터가 파티에 있을 때 사용할 그림
 * @type text
 * @default
 */

/*~struct~FaceImage:
 * @param faceName
 * @text 얼굴 파일명
 * @type text
 * @default
 * @desc 이벤트 "액터 이미지 변경" 등으로 지정되는 얼굴(face) 파일명
 * (확장자 제외). img/faces 폴더 기준.
 *
 * @param faceIndex
 * @text 얼굴 인덱스 (선택)
 * @type text
 * @default
 * @desc 그 얼굴 파일 안에서 몇 번째 칸인지 (0부터 시작). 비워두면
 * 인덱스 상관없이 파일명만 같으면 매칭됩니다.
 *
 * @param slot
 * @text 파티 위치 (선택)
 * @type text
 * @default
 * @desc 1~4. 이 얼굴의 액터가 이 위치(순서)에 있을 때만 적용. 비워두면
 * 위치 상관없이 적용됩니다. 위치 지정 항목이 비워둔 항목보다 우선합니다.
 *
 * @param image
 * @text 이 얼굴일 때 사용할 그림
 * @type text
 * @default
 */

/*~struct~SwitchImage:
 * @param switchId
 * @text 스위치 ID
 * @type switch
 * @default 0
 * @desc 이 스위치가 켜져 있으면 이 이미지를 최종 배너로 사용합니다.
 * 목록에서 위에 있는 항목일수록 우선순위가 높습니다.
 *
 * @param image
 * @text 최종 배너 이미지
 * @type text
 * @default
 */

/*~struct~ActorCountImage:
 * @param actorCount
 * @text 생존 파티원 수
 * @type number
 * @default 1
 *
 * @param image
 * @text 이 인원수일 때 사용할 최종 배너 이미지
 * @type text
 * @default
 */

/*:
 * @plugindesc 전투 중 아군 턴이 시작될 때, 인트로 그림 4장과 "니턴"
 * 배너가 동시에 화면 좌/우에서 중앙으로 등장했다가, 중앙에서 미세하게
 * 흔들리며 대기한 뒤 사라지는 연출을 재생합니다.
 * @author ㄹㅅㅁ
 *
 * @param Image Folder
 * @text 이미지 폴더
 * @desc 이미지를 불러올 img/pictures 안의 하위 폴더명. 비워두면
 * img/pictures 바로 아래에서 찾습니다. 예) yourturn
 * @default yourturn
 *
 * @param --인트로 기본 세트--
 * @default
 *
 * @param Intro Image 1
 * @text 기본 그림 1 (왼쪽)
 * @type text
 * @desc 1번째로 나오는 그림 파일명 (왼쪽에서 등장). 비워두면 이 단계는
 * 건너뜁니다. 아래 세트/액터 매칭에 해당 사항이 없을 때 쓰이는 기본값.
 * @default
 *
 * @param Intro Image 2
 * @text 기본 그림 2 (오른쪽)
 * @type text
 * @desc 2번째로 나오는 그림 파일명 (오른쪽에서 등장)
 * @default
 *
 * @param Intro Image 3
 * @text 기본 그림 3 (왼쪽)
 * @type text
 * @desc 3번째로 나오는 그림 파일명 (왼쪽에서 등장)
 * @default
 *
 * @param Intro Image 4
 * @text 기본 그림 4 (오른쪽)
 * @type text
 * @desc 4번째로 나오는 그림 파일명 (오른쪽에서 등장)
 * @default
 *
 * @param Intro Y Offset 1
 * @text 그림 1 Y위치 조정
 * @type text
 * @desc 기준 Y좌표(Base Y)에서 이 그림만 위/아래로 추가로 이동시킬
 * 픽셀 값. 양수면 아래로, 음수면(-) 위로 이동합니다. 예) -30
 * @default 0
 *
 * @param Intro Y Offset 2
 * @text 그림 2 Y위치 조정
 * @type text
 * @desc 기준 Y좌표(Base Y)에서 이 그림만 위/아래로 추가로 이동시킬
 * 픽셀 값. 양수면 아래로, 음수면(-) 위로 이동합니다. 예) -30
 * @default 0
 *
 * @param Intro Y Offset 3
 * @text 그림 3 Y위치 조정
 * @type text
 * @desc 기준 Y좌표(Base Y)에서 이 그림만 위/아래로 추가로 이동시킬
 * 픽셀 값. 양수면 아래로, 음수면(-) 위로 이동합니다. 예) -30
 * @default 0
 *
 * @param Intro Y Offset 4
 * @text 그림 4 Y위치 조정
 * @type text
 * @desc 기준 Y좌표(Base Y)에서 이 그림만 위/아래로 추가로 이동시킬
 * 픽셀 값. 양수면 아래로, 음수면(-) 위로 이동합니다. 예) -30
 * @default 0
 *
 * @param --인트로 자동/수동 전환--
 * @default
 *
 * @param Intro Switch Sets
 * @text 스위치별 인트로 세트 목록
 * @type struct<IntroSwitchSet>[]
 * @default []
 * @desc 스위치별로 인트로 그림 4장 세트를 통째로 바꾸고 싶을 때 사용.
 * 목록에서 위에 있는 항목일수록 우선순위가 높습니다. (가장 먼저 확인됨)
 *
 * @param Use Actor Images For Intro
 * @text 액터 이미지로 자동 매칭
 * @type boolean
 * @default false
 * @desc 켜두면, 위 스위치 세트에 해당하는 게 없을 때 현재 전투 파티원
 * 구성을 보고 아래 '액터별 이미지' 목록에서 자동으로 그림을 찾아 씁니다.
 * 파티원이 빠지거나 바뀌면 자동으로 반영됩니다.
 *
 * @param Actor Images
 * @text 액터별 이미지 목록
 * @type struct<ActorImage>[]
 * @default []
 * @desc '액터 이미지로 자동 매칭'이 켜져 있을 때 사용. 현재 전투
 * 파티원 순서대로(최대 4명) 여기서 그림을 찾아 인트로 1~4에 배치합니다.
 * 목록에 없는 액터는 기본 그림(Intro Image 1~4)으로 대체됩니다.
 *
 * @param Face Images
 * @text 얼굴별 이미지 목록
 * @type struct<FaceImage>[]
 * @default []
 * @desc '액터 이미지로 자동 매칭'이 켜져 있을 때, 액터의 "현재" 얼굴
 * (이벤트의 액터 이미지 변경으로 바뀐 얼굴 포함)을 기준으로 그림을
 * 찾습니다. 액터별 이미지 목록보다 먼저 확인합니다(더 우선함). 캐릭터가
 * 이벤트로 변신/의상 변경 등을 해서 얼굴이 바뀌면 배너 그림도 자동으로
 * 그 얼굴에 맞게 바뀝니다.
 *
 * @param Micro Drift Distance
 * @text 미세 흔들림 거리
 * @type number
 * @desc 중앙에 머무는 동안(대기/정지 시간) 미세하게 움직이는 거리(px).
 * 왼쪽에서 온 그림은 오른쪽으로, 오른쪽에서 온 그림은 왼쪽으로
 * 이 거리만큼 서서히 이동합니다.
 * @default 15
 *
 * @param Intro Enter Frames
 * @text 인트로 진입 프레임
 * @type number
 * @desc 인트로 그림들이 화면 밖에서 중앙까지 페이드인하며 이동하는 데
 * 걸리는 프레임 수 (0.25초 = 15프레임)
 * @default 15
 *
 * @param Intro Hold Frames
 * @text 인트로 대기 프레임
 * @type number
 * @desc 인트로 그림들이 중앙에 도착한 뒤 멈춰 있는 프레임 수
 * (0.5초 = 30프레임)
 * @default 30
 *
 * @param Intro Fade Frames
 * @text 인트로 퇴장 프레임
 * @type number
 * @desc 인트로 그림들이 중앙을 지나 반대쪽으로 페이드아웃하며 빠져나가는
 * 데 걸리는 프레임 수 (0.25초 = 15프레임)
 * @default 15
 *
 * @param Intro Target Width Rate
 * @text 인트로 그림 크기 비율
 * @type number
 * @decimals 2
 * @desc 인트로 그림 1~4를 화면 가로폭의 몇 %로 자동 맞출지 (0~1)
 * @default 0.5
 *
 * @param --최종 배너--
 * @default
 *
 * @param Final Image Name
 * @text 기본 최종 배너 이미지
 * @type text
 * @desc 마지막에 표시할 "유어턴" 배너 이미지 파일명. 아래 스위치/파티원
 * 수 조건에 해당하는 게 없을 때 사용됩니다.
 * @default 니턴
 *
 * @param Switch Image List
 * @text 스위치별 최종 배너 목록
 * @type struct<SwitchImage>[]
 * @default []
 * @desc 스위치별로 다른 최종 이미지를 쓰고 싶을 때. 목록에서 위에 있는
 * 항목일수록 우선순위가 높습니다.
 *
 * @param Actor Count Image List
 * @text 인원수별 최종 배너 목록
 * @type struct<ActorCountImage>[]
 * @default []
 * @desc 생존 파티원 수에 따라 다른 최종 이미지를 쓰고 싶을 때.
 * (스위치 목록에서 걸리는 게 없을 때 이 목록을 확인합니다)
 *
 * @param Final Enter Frames
 * @text 최종 배너 진입 프레임
 * @type number
 * @desc 최종 배너가 오른쪽 화면 밖에서 중앙까지 들어오는 데 걸리는
 * 프레임 수 (빠르게 들어오다가 중앙 근처에서 느려짐)
 * @default 20
 *
 * @param Final Hold Frames
 * @text 최종 배너 대기 프레임
 * @type number
 * @desc 최종 배너가 중앙에서 멈춰 있는 프레임 수
 * @default 20
 *
 * @param Final Fade Frames
 * @text 최종 배너 퇴장 프레임
 * @type number
 * @desc 최종 배너가 중앙에 멈춘 뒤, 페이드아웃(투명해지며 사라짐)되는
 * 데 걸리는 프레임 수
 * @default 20
 *
 * @param Final Target Width Rate
 * @text 최종 배너 크기 비율
 * @type number
 * @decimals 2
 * @desc 최종 배너를 화면 가로폭의 몇 %로 자동 맞출지 (0~1)
 * @default 0.6
 *
 * @param Final Y Offset
 * @text 최종 배너 Y위치 조정
 * @type text
 * @desc 기준 Y좌표(Base Y)에서 최종 배너만 위/아래로 추가로 이동시킬
 * 픽셀 값. 양수면 아래로, 음수면(-) 위로 이동합니다. 예) -30
 * @default 0
 *
 * @param --공통--
 * @default
 *
 * @param Disable Switch
 * @text 비활성화 스위치
 * @type switch
 * @default 0
 * @desc 이 스위치가 켜져 있으면 이번 전투에서는 배너가 아예 나오지
 * 않습니다. 특정 이벤트 전투 전에 이 스위치를 켜두면 됩니다.
 *
 * @param Base Y
 * @text 기준 Y좌표 비율
 * @type number
 * @decimals 2
 * @desc 모든 이미지가 표시될 기준 Y좌표 (화면 세로 기준 비율, 0~1)
 * @default 0.42
 *
 * @param Intro SE Name
 * @text 인트로 효과음
 * @type file
 * @dir audio/se
 * @desc 인트로 그림 4장이 등장하기 시작할 때 재생할 효과음 (비워두면
 * 재생 안함)
 * @default
 *
 * @param Intro SE Volume
 * @type number
 * @default 90
 *
 * @param Intro SE Pitch
 * @type number
 * @default 100
 *
 * @param SE Name
 * @text 최종 배너 효과음
 * @type file
 * @dir audio/se
 * @desc 최종 배너 등장 시 재생할 효과음 이름 (비워두면 재생 안함)
 * @default
 *
 * @param SE Volume
 * @type number
 * @default 90
 *
 * @param SE Pitch
 * @type number
 * @default 100
 *
 * @help
 * ============================================================================
 * 사용법
 * ============================================================================
 * 1. 그림 파일들을 img/pictures/Image Folder(기본값: yourturn) 폴더 안에
 *    넣으세요. 예) img/pictures/yourturn/그림1.png
 * 2. 플러그인 매개변수의 기본 그림 1~4, 기본 최종 배너 이미지 등에는
 *    파일 선택 버튼이 아니라 텍스트 입력창에 파일명만 직접 입력하세요
 *    (확장자 .png는 빼고, 예: 그림1). MV 에디터의 파일 선택 버튼은
 *    img/pictures 하위 폴더(yourturn 등)를 인식하지 못해서 직접 입력
 *    방식으로 되어 있습니다.
 * 3. 플러그인을 켜두면, 적 턴이 끝나고 다시 아군(파티)의 턴이 시작될
 *    때(라운드당 1회)만 자동으로 연출이 재생됩니다.
 *
 * 연출 순서
 *   1) 인트로 그림 1~4와 Final 배너(니턴)가 모두 같은 타이밍에 동시에
 *      애니메이션을 시작합니다.
 *      - 그림 1, 3: 왼쪽 화면 밖 -> 중앙으로 페이드인하며 이동
 *      - 그림 2, 4 및 Final 배너: 오른쪽 화면 밖 -> 중앙으로 등장
 *   2) 중앙에서 대기하는 동안, 왼쪽에서 온 그림은 오른쪽으로, 오른쪽에서
 *      온 그림(Final 배너 포함)은 왼쪽으로 미세하게(Micro Drift
 *      Distance) 계속 움직입니다.
 *   3) 인트로 4장은 대기가 끝나면 그 방향 그대로 반대쪽까지 계속
 *      이동하며 페이드아웃되어 사라집니다.
 *   4) Final 배너는 자신의 대기 시간(Final Hold Frames)이 끝나면 그
 *      자리에서 페이드아웃되며 사라집니다.
 *   5) 인트로와 Final 배너가 모두 사라지면 연출이 끝나고 커맨드 입력이
 *      가능해집니다.
 *
 * 기본 그림 1~4 중 비워둔 항목은 건너뛰고 다음 단계로 넘어갑니다.
 * 모두 비워두면 바로 Final 배너만 재생됩니다.
 *
 * ----------------------------------------------------------------------------
 * 그림별 Y위치 미세 조정
 * ----------------------------------------------------------------------------
 * 공통 기준 Y좌표(Base Y)는 그대로 두고, 그림마다 위/아래로 살짝 다르게
 * 배치하고 싶을 때 "그림 1~4 Y위치 조정"과 "최종 배너 Y위치 조정"에
 * 픽셀 값을 입력하세요. 양수를 넣으면 그만큼 아래로, 음수를 넣으면
 * 그만큼 위로 이동합니다. (예: 그림 2만 20 입력 -> 그림 2만 다른 그림보다
 * 20px 아래에 표시)
 *
 * ----------------------------------------------------------------------------
 * 인트로 그림 4장을 상황에 따라 바꾸는 두 가지 방법 (같이 써도 됨)
 * ----------------------------------------------------------------------------
 * 매번 텍스트를 직접 입력할 필요 없이, 플러그인 매니저 목록 창에서
 * 항목을 추가/편집하는 방식으로 정리했습니다. 우선순위는 아래 순서대로
 * 확인합니다.
 *
 * (1) 스위치별 인트로 세트 목록 (Intro Switch Sets)
 *     목록에 스위치ID + 그림1~4를 한 세트로 추가해두면, 그 스위치가
 *     켜져 있을 때 세트 전체가 통째로 바뀝니다. 여러 세트를 등록해두고
 *     동시에 여러 스위치가 켜져 있으면 "목록에서 더 위에 있는" 세트가
 *     우선 적용됩니다. 세트 안에서 특정 칸을 비워두면 그 칸만 기본
 *     그림 1~4 값을 사용합니다. (보스전 연출, 특수 이벤트 등 특정
 *     상황을 스위치로 켜서 강제로 바꾸고 싶을 때 사용)
 *
 * (2) 액터 이미지로 자동 매칭 (Use Actor Images For Intro + Face Images
 *     + Actor Images)
 *     '액터 이미지로 자동 매칭'을 켜두면, 위 스위치 세트에 해당하는 게
 *     없을 때 현재 전투 파티원(battleMembers, 최대 4명)을 그대로 읽어서
 *     인트로 1~4를 자동 구성합니다. 각 파티원마다 아래 순서로 그림을
 *     찾습니다.
 *       ① 얼굴별 이미지 목록(Face Images) - 그 액터의 "현재" 얼굴
 *          파일명이 일치하는 항목이 있으면 그 그림을 사용합니다.
 *          얼굴 인덱스는 선택 사항입니다 - 지정하면 그 칸까지 정확히
 *          일치해야 하고, 비워두면 인덱스 상관없이 파일명만 같아도
 *          매칭됩니다. 이벤트의 "액터 이미지 변경"으로 얼굴이
 *          바뀌면(변신, 의상 교체 등) 다음 라운드부터 자동으로 그
 *          얼굴에 맞는 배너 그림으로 바뀝니다. 액터 ID가 아니라 "지금
 *          실제로 쓰이고 있는 얼굴 그래픽"을 기준으로 판정하기
 *          때문입니다.
 *       ② 액터별 이미지 목록(Actor Images) - ①에 해당하는 게 없으면
 *          액터 ID 기준으로 매칭합니다.
 *       ③ 둘 다 없으면 기본 그림(Intro Image 1~4)으로 대체됩니다.
 *     ①②의 각 항목에는 '파티 위치(1~4)'를 선택적으로 지정할 수 있습니다.
 *     같은 캐릭터라도 위치(=등장 방향: 1,3 왼쪽 / 2,4 오른쪽)에 따라 다른
 *     그림을 쓰고 싶을 때, 위치를 비운 기본 항목 하나 + 위치를 지정한
 *     항목을 추가로 등록하세요. 우선순위: 위치+인덱스 > 위치 > 인덱스 >
 *     파일명만. (점수가 같으면 목록에서 위에 있는 항목 우선)
 *     ※ 얼굴 매칭은 "액터 이미지 변경" 이벤트로 마지막에 지정한 얼굴을
 *       먼저 확인합니다. 다중인격 플러그인 등이 전투 중 얼굴을 다른
 *       파일로 덮어써도, 이벤트로 바꾼 얼굴 기준으로 등록한 항목이
 *       적용됩니다. (해당 항목이 없으면 현재 실제 얼굴로 다시 확인)
 *     파티원이 교체되거나 전투 중 이탈해도 다음 라운드부터 자동으로
 *     반영되므로, 조합마다 스위치를 일일이 만들 필요가 없습니다.
 *     (특정 상황에서만 강제로 다른 그림을 쓰고 싶다면 (1)의 스위치
 *     세트를 함께 등록해 두세요. 스위치가 켜져 있으면 그쪽이 우선합니다)
 *
 * 셋 다 해당 사항이 없으면 기본 그림 1~4를 사용합니다.
 *
 * ----------------------------------------------------------------------------
 * 특정 전투에서 배너 자체를 끄기
 * ----------------------------------------------------------------------------
 * Disable Switch에 스위치를 지정해두면, 그 스위치가 켜져 있는 동안은
 * 이 전투에서 배너가 아예 재생되지 않습니다. 특정 이벤트 전투(연출용
 * 특수 전투, 튜토리얼 전투 등) 직전에 그 스위치를 켜고, 전투가 끝나면
 * 다시 꺼주면 됩니다.
 *
 * ----------------------------------------------------------------------------
 * 최종 배너 이미지를 상황에 따라 바꾸기
 * ----------------------------------------------------------------------------
 * 스위치별 최종 배너 목록(Switch Image List)과 인원수별 최종 배너
 * 목록(Actor Count Image List)도 같은 방식으로 목록에서 추가/편집합니다.
 * 확인 순서: 스위치 목록 -> 인원수 목록 -> 기본 최종 배너 이미지.
 *
 * 플러그인 순서: YEP_BattleEngineCore 아래, 전투 UI 관련 커스텀 플러그인
 * (BattleUIRework.js 등)과는 순서 상관없이 동작하도록 설계되었습니다.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.YourTurnBanner = true;

var YTB = YTB || {};

(function() {

    var parameters = PluginManager.parameters('YourTurnBanner');
    YTB.imageFolder  = String(parameters['Image Folder'] || '').trim();

    YTB.introImages = [
        String(parameters['Intro Image 1'] || '').trim(),
        String(parameters['Intro Image 2'] || '').trim(),
        String(parameters['Intro Image 3'] || '').trim(),
        String(parameters['Intro Image 4'] || '').trim()
    ];
    YTB.introDirections = ['left', 'right', 'left', 'right'];
    YTB.introYOffsets = [
        Number(parameters['Intro Y Offset 1'] || 0),
        Number(parameters['Intro Y Offset 2'] || 0),
        Number(parameters['Intro Y Offset 3'] || 0),
        Number(parameters['Intro Y Offset 4'] || 0)
    ];
    YTB.introEnterFrames = Number(parameters['Intro Enter Frames'] || 10);
    YTB.introHoldFrames  = Number(parameters['Intro Hold Frames'] || 6);
    YTB.introFadeFrames  = Number(parameters['Intro Fade Frames'] || 8);
    YTB.introTargetWidthRate = Number(parameters['Intro Target Width Rate'] || 0.5);
    YTB.introSeName   = String(parameters['Intro SE Name'] || '');
    YTB.introSeVolume = Number(parameters['Intro SE Volume'] || 90);
    YTB.introSePitch  = Number(parameters['Intro SE Pitch'] || 100);

    YTB.finalImageName = String(parameters['Final Image Name'] || '니턴');
    YTB.finalEnterFrames = Number(parameters['Final Enter Frames'] || 20);
    YTB.finalHoldFrames  = Number(parameters['Final Hold Frames'] || 20);
    YTB.finalFadeFrames  = Number(parameters['Final Fade Frames'] || 20);
    YTB.finalTargetWidthRate = Number(parameters['Final Target Width Rate'] || 0.6);
    YTB.finalYOffset = Number(parameters['Final Y Offset'] || 0);

    YTB.baseYRate    = Number(parameters['Base Y'] || 0.48);
    YTB.disableSwitch = Number(parameters['Disable Switch'] || 0);
    YTB.microDrift   = Number(parameters['Micro Drift Distance'] || 15);
    YTB.seName       = String(parameters['SE Name'] || '');
    YTB.seVolume     = Number(parameters['SE Volume'] || 90);
    YTB.sePitch      = Number(parameters['SE Pitch'] || 100);

    YTB.useActorImages = String(parameters['Use Actor Images For Intro'] || 'false') === 'true';

    //=========================================================================
    // 하위 폴더 포함 이미지 로드
    //=========================================================================
    YTB.loadPicture = function(imageName) {
        var folder = 'img/pictures/';
        if (YTB.imageFolder) {
            folder += YTB.imageFolder + '/';
        }
        var path = folder + imageName;
        var bitmap = ImageManager.loadBitmap(folder, imageName, 0, true);
        bitmap.addLoadListener(function() {
            if (bitmap.width === 0 || bitmap.height === 0) {
                console.warn('[YourTurnBanner] 이미지 로드 실패 또는 크기 0: ' + path +
                    ' (경로/파일명/폴더를 확인하세요)');
            }
        });
        return bitmap;
    };

    // 로딩이 끝났는지(성공/실패 모두 포함) 판정. RPG Maker MV의 Bitmap은
    // 로드 실패(존재하지 않는 파일 등) 시 isReady()가 계속 false로 남기
    // 때문에, 실패(_loadingState === 'error')도 "더 이상 기다릴 필요 없음"
    // 으로 취급해서 무한 대기(창 잠김 고착)를 방지한다.
    YTB.isBitmapSettled = function(bitmap) {
        if (!bitmap) return true;
        if (bitmap.isReady()) return true;
        if (bitmap._loadingState === 'error') return true;
        return false;
    };

    //=========================================================================
    // struct 배열 파라미터 파싱: "[\"{...}\",\"{...}\"]" -> [{...}, {...}]
    //=========================================================================
    function parseStructArray(raw) {
        var list = [];
        if (!raw) return list;
        var arr;
        try {
            arr = JSON.parse(raw);
        } catch (e) {
            console.warn('[YourTurnBanner] 목록 파라미터 파싱 실패: ' + raw);
            return list;
        }
        for (var i = 0; i < arr.length; i++) {
            try {
                list.push(JSON.parse(arr[i]));
            } catch (e2) {
                // 개별 항목이 깨진 경우는 건너뜀
            }
        }
        return list;
    }

    // 스위치별 인트로 세트
    var introSwitchSetsRaw = parseStructArray(parameters['Intro Switch Sets']);
    YTB.introSwitchSets = introSwitchSetsRaw.map(function(e) {
        return {
            switchId: Number(e.switchId || 0),
            images: [
                String(e.image1 || '').trim(),
                String(e.image2 || '').trim(),
                String(e.image3 || '').trim(),
                String(e.image4 || '').trim()
            ]
        };
    });

    // 선택 입력 숫자 파싱 (비었거나 숫자가 아니면 fallback)
    function optNumber(v, fallback) {
        var str = String(v === undefined || v === null ? '' : v).trim();
        if (str === '') return fallback;
        var n = Number(str);
        return isNaN(n) ? fallback : n;
    }

    // 액터별 인트로 이미지 [{actorId, slot(0=상관없음), image}]
    var actorImagesRaw = parseStructArray(parameters['Actor Images']);
    YTB.actorImageList = [];
    for (var ai = 0; ai < actorImagesRaw.length; ai++) {
        var actorId = Number(actorImagesRaw[ai].actorId || 0);
        var actorImg = String(actorImagesRaw[ai].image || '').trim();
        if (actorId > 0 && actorImg) {
            YTB.actorImageList.push({
                actorId: actorId,
                slot: optNumber(actorImagesRaw[ai].slot, 0),
                image: actorImg
            });
        }
    }

    // 얼굴별 인트로 이미지 [{faceName, faceIndex(-1=상관없음), slot(0=상관없음), image}]
    // (이벤트/다중인격 등으로 얼굴이 바뀌어도 현재 얼굴 기준으로 매칭)
    var faceImagesRaw = parseStructArray(parameters['Face Images']);
    YTB.faceImageList = [];
    for (var fi = 0; fi < faceImagesRaw.length; fi++) {
        var faceName = String(faceImagesRaw[fi].faceName || '').trim();
        var faceImg = String(faceImagesRaw[fi].image || '').trim();
        if (!faceName || !faceImg) continue;
        YTB.faceImageList.push({
            faceName: faceName,
            faceIndex: optNumber(faceImagesRaw[fi].faceIndex, -1),
            slot: optNumber(faceImagesRaw[fi].slot, 0),
            image: faceImg
        });
    }

    // 조건에 맞는 항목 중 가장 구체적인 것 선택
    // 점수: 위치 지정 +2, 인덱스 지정 +1 (동점이면 목록 위쪽 우선)
    YTB.findFaceImageBy = function(faceName, faceIndex, slotNo) {
        var best = null, bestScore = -1;
        for (var i = 0; i < YTB.faceImageList.length; i++) {
            var e = YTB.faceImageList[i];
            if (e.faceName !== faceName) continue;
            if (e.faceIndex >= 0 && e.faceIndex !== faceIndex) continue;
            if (e.slot > 0 && e.slot !== slotNo) continue;
            var score = (e.slot > 0 ? 2 : 0) + (e.faceIndex >= 0 ? 1 : 0);
            if (score > bestScore) { best = e; bestScore = score; }
        }
        return best ? best.image : '';
    };

    // 얼굴 매칭: "액터 이미지 변경" 이벤트로 마지막에 지정한 얼굴을 먼저
    // 확인하고, 없으면 현재 실제 얼굴로 확인한다. (다중인격 플러그인 등이
    // 전투 중 얼굴을 덮어써도 이벤트로 바꾼 얼굴 기준 설정이 적용되도록)
    YTB.findFaceImage = function(actor, slotNo) {
        var img = '';
        var ef = actor._ytbEventFace;
        if (ef) img = YTB.findFaceImageBy(ef.name, ef.index, slotNo);
        if (!img) img = YTB.findFaceImageBy(actor.faceName(), actor.faceIndex(), slotNo);
        return img;
    };

    YTB.findActorImage = function(actor, slotNo) {
        var best = null, bestScore = -1;
        for (var i = 0; i < YTB.actorImageList.length; i++) {
            var e = YTB.actorImageList[i];
            if (e.actorId !== actor.actorId()) continue;
            if (e.slot > 0 && e.slot !== slotNo) continue;
            var score = e.slot > 0 ? 1 : 0;
            if (score > bestScore) { best = e; bestScore = score; }
        }
        return best ? best.image : '';
    };

    // 스위치별 최종 배너
    var switchImageListRaw = parseStructArray(parameters['Switch Image List']);
    YTB.switchImageList = switchImageListRaw.map(function(e) {
        return { key: Number(e.switchId || 0), name: String(e.image || '').trim() };
    }).filter(function(e) { return !!e.name; });

    // 인원수별 최종 배너
    var actorCountImageListRaw = parseStructArray(parameters['Actor Count Image List']);
    YTB.actorCountImageList = actorCountImageListRaw.map(function(e) {
        return { key: Number(e.actorCount || 0), name: String(e.image || '').trim() };
    }).filter(function(e) { return !!e.name; });

    //=========================================================================
    // "액터 이미지 변경" 이벤트 명령으로 지정한 얼굴을 따로 기록
    // (세이브 데이터에도 함께 저장됨)
    //=========================================================================
    var _alias_command322 = Game_Interpreter.prototype.command322;
    Game_Interpreter.prototype.command322 = function() {
        var actor = $gameActors.actor(this._params[0]);
        if (actor) {
            actor._ytbEventFace = { name: this._params[3], index: this._params[4] };
        }
        return _alias_command322.call(this);
    };

    //=========================================================================
    // 상황에 맞는 인트로 4장 이미지 목록 결정
    //=========================================================================
    YTB.decideIntroImages = function() {
        // (1) 스위치 세트 우선
        for (var i = 0; i < YTB.introSwitchSets.length; i++) {
            var set = YTB.introSwitchSets[i];
            if (set.switchId > 0 && $gameSwitches.value(set.switchId)) {
                var result = [];
                for (var j = 0; j < 4; j++) {
                    result.push(set.images[j] || YTB.introImages[j] || '');
                }
                return result;
            }
        }

        // (2) 액터 이미지 자동 매칭 (현재 전투 파티 구성을 그대로 반영)
        if (YTB.useActorImages) {
            var members = $gameParty.battleMembers();
            var autoResult = [];
            var matchedAny = false;
            for (var k = 0; k < 4; k++) {
                var actor = members[k];
                var img = '';
                if (actor) {
                    // (2-1) 현재 얼굴(face) 기준 매칭이 최우선 - 이벤트로
                    // "액터 이미지 변경"을 해서 얼굴이 바뀌면 여기서 바로 반영됨
                    // 파일명+인덱스 정확히 일치하는 항목을 먼저 찾고,
                    // 없으면 파일명만 일치하는 항목(인덱스 무시)을 찾는다.
                    // 위치(1~4)까지 지정된 항목이 있으면 그것을 우선한다.
                    img = YTB.findFaceImage(actor, k + 1);
                    // (2-2) 얼굴 매칭이 없으면 액터ID 기준 매칭
                    if (!img) {
                        img = YTB.findActorImage(actor, k + 1);
                    }
                    if (img) matchedAny = true;
                    // 실제 파티원인데 매칭되는 그림이 없으면 그때만 기본
                    // 그림(Intro Image k)으로 대체
                    if (!img) img = YTB.introImages[k] || '';
                }
                // 그 자리에 실제 파티원이 없으면(파티가 4명 미만) 아예
                // 건너뛴다 - 기본 그림으로라도 대체하지 않음 (파티에 없는
                // 캐릭터 그림이 나오는 것을 방지)
                autoResult.push(img);
            }
            if (matchedAny) return autoResult;
        }

        // (3) 기본 세트
        return YTB.introImages;
    };

    //=========================================================================
    // 상황에 맞는 최종 이미지 이름 결정
    //=========================================================================
    YTB.decideFinalImageName = function() {
        for (var i = 0; i < YTB.switchImageList.length; i++) {
            var pair = YTB.switchImageList[i];
            if (pair.key > 0 && $gameSwitches.value(pair.key)) return pair.name;
        }
        var aliveCount = $gameParty.battleMembers().filter(function(a) {
            return a.isAlive();
        }).length;
        for (var j = 0; j < YTB.actorCountImageList.length; j++) {
            var cPair = YTB.actorCountImageList[j];
            if (cPair.key === aliveCount) return cPair.name;
        }
        return YTB.finalImageName;
    };

    //=========================================================================
    // Easing
    //=========================================================================
    function easeOutCubic(t) {
        var f = t - 1;
        return f * f * f + 1;
    }
    function easeInCubic(t) {
        return t * t * t;
    }

    //=========================================================================
    // Sprite_YTBSlide : 한 장의 이미지를 지정된 방향에서 중앙으로/밖으로
    // 슬라이드시키는 범용 스프라이트
    //=========================================================================
    function Sprite_YTBSlide() {
        this.initialize.apply(this, arguments);
    }

    Sprite_YTBSlide.prototype = Object.create(Sprite.prototype);
    Sprite_YTBSlide.prototype.constructor = Sprite_YTBSlide;

    // fromSide: 'left' | 'right' - 처음 등장하는 방향
    // yOffset: 기준 Y좌표에 추가로 더할 픽셀 값 (그림별 미세 위치 조정용)
    Sprite_YTBSlide.prototype.initialize = function(imageName, fromSide, targetWidthRate, yOffset) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = YTB.loadPicture(imageName);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._fromSide = fromSide;
        this._targetWidthRate = targetWidthRate;
        this._baseY = Graphics.height * YTB.baseYRate + (yOffset || 0);
        this._sized = false;
        this.y = this._baseY;
    };

    Sprite_YTBSlide.prototype.isReady = function() {
        return YTB.isBitmapSettled(this.bitmap);
    };

    // fromSide 쪽 화면 밖 -> 중앙 -> exitSide 쪽 화면 밖으로 계속 이동하는
    // 동선을 미리 계산해둔다 (동기화된 동시 재생을 위해 위치를 t값으로 조회)
    Sprite_YTBSlide.prototype.setupPath = function(exitSide) {
        if (this._pathReady) return;
        var targetWidth = Graphics.width * this._targetWidthRate;
        var scale = this.bitmap.width > 0 ? targetWidth / this.bitmap.width : 1;
        this.scale.x = scale;
        this.scale.y = scale;
        var w = this.bitmap.width * scale;
        this._centerX = Graphics.width / 2;
        this._startX = (this._fromSide === 'left') ?
            -(Graphics.width / 2 + w / 2) : (Graphics.width / 2 + w / 2);
        this._endX = (exitSide === 'left') ?
            -(Graphics.width / 2 + w / 2) : (Graphics.width / 2 + w / 2);
        this.x = this._startX;
        this.opacity = 0;
        this._pathReady = true;
    };

    Sprite_YTBSlide.prototype.applyEnter = function(t) {
        this.x = this._startX + (this._centerX - this._startX) * t;
        this.opacity = Math.round(255 * t);
    };

    // 중앙에서 대기하는 동안 미세하게 드리프트 (좌측 유입 -> 우측으로,
    // 우측 유입 -> 좌측으로). 도착 지점을 기록해두어 이후 Exit가 이어서
    // 자연스럽게 시작되도록 한다.
    Sprite_YTBSlide.prototype.applyHold = function(t) {
        var driftDir = (this._fromSide === 'left') ? 1 : -1;
        this._holdX = this._centerX + driftDir * YTB.microDrift * (t || 0);
        this.x = this._holdX;
        this.opacity = 255;
    };

    Sprite_YTBSlide.prototype.applyExit = function(t) {
        var startX = (this._holdX !== undefined) ? this._holdX : this._centerX;
        this.x = startX + (this._endX - startX) * t;
        this.opacity = Math.round(255 * (1 - t));
    };

    // 최종 배너용 (기존 방식: 밖 -> 중앙, 빠르게 오다가 느려짐)
    Sprite_YTBSlide.prototype.setupSize = function() {
        if (this._sized) return;
        var targetWidth = Graphics.width * this._targetWidthRate;
        var scale = this.bitmap.width > 0 ? targetWidth / this.bitmap.width : 1;
        this.scale.x = scale;
        this.scale.y = scale;
        var w = this.bitmap.width * scale;
        this._centerX = Graphics.width / 2;
        this._offX = (this._fromSide === 'left') ?
            -(Graphics.width / 2 + w / 2) : (Graphics.width / 2 + w / 2);
        this.x = this._centerX + this._offX;
        this._sized = true;
    };

    // 밖 -> 중앙 (빠르게 오다가 도착 근처에서 느려짐)
    Sprite_YTBSlide.prototype.moveToCenter = function(frames, count) {
        var t = Math.min(count / Math.max(frames, 1), 1);
        var e = easeOutCubic(t);
        this.x = (this._centerX + this._offX) + (this._centerX - (this._centerX + this._offX)) * e;
        return t >= 1;
    };

    // 중앙에서 대기하며 미세하게 드리프트 (Final 배너용)
    Sprite_YTBSlide.prototype.applyFinalHold = function(t) {
        var driftDir = (this._fromSide === 'left') ? 1 : -1;
        this.x = this._centerX + driftDir * YTB.microDrift * t;
    };

    // 중앙(또는 드리프트된 위치)에서 그대로 페이드아웃 (투명해지며 사라짐)
    Sprite_YTBSlide.prototype.fadeOut = function(frames, count) {
        var t = Math.min(count / Math.max(frames, 1), 1);
        this.opacity = Math.round(255 * (1 - t));
        return t >= 1;
    };

    //=========================================================================
    // Sprite_YourTurnBanner : 인트로 4장 + 최종 배너를 순서대로 진행하는
    // 컨트롤러
    //=========================================================================
    function Sprite_YourTurnBanner() {
        this.initialize.apply(this, arguments);
    }

    Sprite_YourTurnBanner.prototype = Object.create(Sprite.prototype);
    Sprite_YourTurnBanner.prototype.constructor = Sprite_YourTurnBanner;

    Sprite_YourTurnBanner.prototype.initialize = function(finalImageName) {
        Sprite.prototype.initialize.call(this);
        this._finished = false;

        // 인트로 4장 준비 (비어있지 않은 것만)
        var introImages = YTB.decideIntroImages();
        this._introSprites = [];
        for (var i = 0; i < introImages.length; i++) {
            if (!introImages[i]) continue;
            var fromSide = YTB.introDirections[i];
            var exitSide = (fromSide === 'left') ? 'right' : 'left'; // 지나온 방향 그대로 반대쪽까지 계속 이동
            var sprite = new Sprite_YTBSlide(introImages[i], fromSide, YTB.introTargetWidthRate, YTB.introYOffsets[i]);
            sprite._exitSide = exitSide;
            this.addChild(sprite);
            this._introSprites.push(sprite);
        }
        this._introPhase = this._introSprites.length > 0 ? 'enter' : 'done';
        this._introCount = 0;
        this._introSeDone = false;

        // Final 배너도 인트로와 동시에 시작 (같이 나오도록). 나중에 추가해서
        // 인트로 그림들보다 위(앞)에 그려지게 한다.
        this._finalSprite = new Sprite_YTBSlide(finalImageName, 'right', YTB.finalTargetWidthRate, YTB.finalYOffset);
        this.addChild(this._finalSprite);
        this._finalPhase = 'in';
        this._finalCount = 0;
        this._finalSeDone = false;

        // 안전장치: 어떤 이유로든(알 수 없는 예외 상황 포함) 연출이 멈춰서
        // 창 잠금이 영원히 풀리지 않는 사고를 막기 위한 최대 재생 시간
        // 워치독. 이 시간을 넘기면 무조건 강제 종료 처리한다.
        this._watchdogFrames = 0;
        this._watchdogLimit = 10 * 60; // 10초 (60fps 기준)
    };

    Sprite_YourTurnBanner.prototype.isFinished = function() {
        return this._finished;
    };

    Sprite_YourTurnBanner.prototype._introSpritesReady = function() {
        for (var i = 0; i < this._introSprites.length; i++) {
            if (!this._introSprites[i].isReady()) return false;
        }
        return true;
    };

    Sprite_YourTurnBanner.prototype._updateIntro = function() {
        if (this._introPhase === 'done') return;
        if (!this._introSpritesReady()) return;
        for (var i = 0; i < this._introSprites.length; i++) {
            this._introSprites[i].setupPath(this._introSprites[i]._exitSide);
        }
        if (!this._introSeDone) {
            this._introSeDone = true;
            if (YTB.introSeName) {
                AudioManager.playSe({ name: YTB.introSeName, volume: YTB.introSeVolume, pitch: YTB.introSePitch, pan: 0 });
            }
        }

        switch (this._introPhase) {
            case 'enter': {
                this._introCount++;
                var t1 = Math.min(this._introCount / Math.max(YTB.introEnterFrames, 1), 1);
                for (var a = 0; a < this._introSprites.length; a++) {
                    this._introSprites[a].applyEnter(t1);
                }
                if (t1 >= 1) {
                    this._introCount = 0;
                    this._introPhase = YTB.introHoldFrames > 0 ? 'hold' : 'exit';
                }
                break;
            }
            case 'hold': {
                this._introCount++;
                var th = Math.min(this._introCount / Math.max(YTB.introHoldFrames, 1), 1);
                for (var b = 0; b < this._introSprites.length; b++) {
                    this._introSprites[b].applyHold(th);
                }
                if (this._introCount >= YTB.introHoldFrames) {
                    this._introCount = 0;
                    this._introPhase = 'exit';
                }
                break;
            }
            case 'exit': {
                this._introCount++;
                var t2 = Math.min(this._introCount / Math.max(YTB.introFadeFrames, 1), 1);
                for (var c = 0; c < this._introSprites.length; c++) {
                    this._introSprites[c].applyExit(t2);
                }
                if (t2 >= 1) {
                    for (var d = 0; d < this._introSprites.length; d++) {
                        this.removeChild(this._introSprites[d]);
                    }
                    this._introSprites = [];
                    this._introPhase = 'done';
                }
                break;
            }
        }
    };

    Sprite_YourTurnBanner.prototype._updateFinal = function() {
        if (this._finalPhase === 'done') return;
        var sprite = this._finalSprite;
        if (!sprite.isReady()) return;
        sprite.setupSize();
        if (!this._finalSeDone) {
            this._finalSeDone = true;
            if (YTB.seName) {
                AudioManager.playSe({ name: YTB.seName, volume: YTB.seVolume, pitch: YTB.sePitch, pan: 0 });
            }
        }

        switch (this._finalPhase) {
            case 'in':
                this._finalCount++;
                if (sprite.moveToCenter(YTB.finalEnterFrames, this._finalCount)) {
                    this._finalCount = 0;
                    this._finalPhase = YTB.finalHoldFrames > 0 ? 'hold' : 'fade';
                }
                break;
            case 'hold': {
                this._finalCount++;
                var th = Math.min(this._finalCount / Math.max(YTB.finalHoldFrames, 1), 1);
                sprite.applyFinalHold(th);
                if (this._finalCount >= YTB.finalHoldFrames) {
                    this._finalCount = 0;
                    this._finalPhase = 'fade';
                }
                break;
            }
            case 'fade':
                this._finalCount++;
                if (sprite.fadeOut(YTB.finalFadeFrames, this._finalCount)) {
                    this._finalPhase = 'done';
                }
                break;
        }
    };

    Sprite_YourTurnBanner.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._finished) return;

        this._watchdogFrames++;
        if (this._watchdogFrames > this._watchdogLimit) {
            console.warn('[YourTurnBanner] 연출이 너무 오래 걸려 강제로 종료합니다. ' +
                '(이미지 로드 실패 등 원인 확인 필요)');
            this._finished = true;
            return;
        }

        this._updateIntro();
        this._updateFinal();
        if (this._introPhase === 'done' && this._finalPhase === 'done') {
            this._finished = true;
        }
    };

    //=========================================================================
    // Scene_Battle
    //=========================================================================

    var _alias_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _alias_createDisplayObjects.call(this);
        this._ytbTurnCount = -1;
        this._ytbLockedWindows = null;
    };

    // 라운드(턴)가 시작되어 아군 커맨드 입력 단계로 넘어올 때만 1회 재생.
    // (SkipPartyCommand.js 등으로 파티 커맨드 창이 생략되어 있어도
    // startPartyCommandSelection 자체는 매 라운드 시작 시 호출됨)
    var _alias_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        _alias_startPartyCommandSelection.call(this);
        if (YTB.disableSwitch > 0 && $gameSwitches.value(YTB.disableSwitch)) return; // 이 전투에서는 비활성화
        var turnCount = $gameTroop.turnCount();
        if (this._ytbTurnCount === turnCount) return; // 같은 라운드 중복 방지
        this._ytbTurnCount = turnCount;
        this.startYourTurnBanner();
    };

    Scene_Battle.prototype.startYourTurnBanner = function() {
        // 안전장치: 혹시 이전 배너가 아직 안 끝난 상태에서 다시 호출되면
        // (이론상 발생하면 안 되지만) 먼저 확실히 정리하고 시작한다.
        // 그렇지 않으면 이전 잠금이 절대 안 풀리는 사고로 이어질 수 있다.
        if (this._ytbSprite) {
            this.removeChild(this._ytbSprite);
            this._ytbSprite = null;
            this.unlockBattleWindowsForYourTurn();
        }
        this.lockBattleWindowsForYourTurn();
        var finalImageName = YTB.decideFinalImageName();
        var sprite = new Sprite_YourTurnBanner(finalImageName);
        this._ytbSprite = sprite;
        this.addChild(sprite);
    };

    Scene_Battle.prototype.lockBattleWindowsForYourTurn = function() {
        var locked = [];
        var layer = this._windowLayer;
        if (layer) {
            for (var i = 0; i < layer.children.length; i++) {
                var win = layer.children[i];
                if (win instanceof Window && win.active) {
                    locked.push({ win: win, wasVisible: win.visible });
                    win.active = false;
                    // ActorStatusClickSelect.js 등 일부 커스텀 플러그인은
                    // active 상태를 무시하고 클릭을 인식하므로(visible만
                    // 체크), 확실히 입력을 막기 위해 visible도 함께 끈다.
                    win.visible = false;
                }
            }
        }
        this._ytbLockedWindows = locked;
    };

    Scene_Battle.prototype.unlockBattleWindowsForYourTurn = function() {
        var locked = this._ytbLockedWindows;
        if (locked) {
            for (var i = 0; i < locked.length; i++) {
                var entry = locked[i];
                if (entry.win) {
                    entry.win.active = true;
                    entry.win.visible = entry.wasVisible;
                }
            }
        }
        this._ytbLockedWindows = null;
    };

    var _alias_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        // 배너 재생 중에는 이번 프레임의 키/마우스/터치 입력 자체를 통째로
        // 비워서, 창의 active/visible 상태를 확인하지 않는 커스텀 입력
        // 처리(단축키, 클릭 감지 등)까지 포함해 전투 화면으로 어떤 입력도
        // 전달되지 않게 한다. (원본 update보다 먼저 실행해서, 원본 update
        // 안의 모든 로직이 "이번 프레임엔 입력이 없었다"고 보게 만든다)
        if (this._ytbSprite) {
            Input.clear();
            TouchInput.clear();
        }

        _alias_update.call(this);
        if (this._ytbSprite) {
            // 액터/전투 스프라이트에 가려지지 않도록 매 프레임 최상단으로 유지
            this.addChild(this._ytbSprite);
            if (this._ytbSprite.isFinished()) {
                this.removeChild(this._ytbSprite);
                this._ytbSprite = null;
                this.unlockBattleWindowsForYourTurn();
                // 배너가 막 끝난 프레임에도 혹시 남아있는 입력이 그대로
                // 다음 로직에 튀지 않도록 한 번 더 비워준다.
                Input.clear();
                TouchInput.clear();
            }
        }
    };

    // 전투 씬이 어떤 이유로든 종료될 때, 잠금 정보가 남아있다면 확실히
    // 해제한다 (다음 전투/씬에 영향이 가지 않도록 하는 마지막 안전장치).
    var _alias_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        if (this._ytbLockedWindows) {
            this.unlockBattleWindowsForYourTurn();
        }
        _alias_terminate.call(this);
    };

})();
