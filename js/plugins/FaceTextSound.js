//=============================================================================
// FaceTextSound.js
//=============================================================================
// 기반: Iavra Text Sound.js (Iavra) - 문자 출력 사운드 재생 로직을 참고해
// 얼굴 이미지(파일명+인덱스)에 따라 다른 사운드를 파라미터로 지정하도록
// 확장했습니다.
//=============================================================================

/*:
 * @plugindesc 대사창에 표시된 얼굴(페이스) 이미지/인덱스에 따라 글자 출력음을 다르게 재생합니다.
 * @author ㄹㅅㅁ
 *
 * @param FaceSoundList
 * @text 얼굴별 사운드 목록
 * @type struct<FaceSound>[]
 * @desc 얼굴 이미지(+인덱스) 조합마다 사용할 사운드를 등록합니다.
 * 위에서부터 검사해서 먼저 일치하는 항목을 사용합니다.
 * @default []
 *
 * @param DefaultSound
 * @text 기본 사운드
 * @type string
 * @desc 목록에 일치하는 얼굴이 없을 때 사용할 기본 효과음 파일명. 비워두면
 * 소리가 나지 않습니다.
 * @default
 *
 * @param DefaultPan
 * @text 기본 팬
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @param DefaultPitch
 * @text 기본 피치
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param DefaultVolume
 * @text 기본 볼륨
 * @type number
 * @min 0
 * @max 100
 * @default 80
 *
 * @param DefaultInterval
 * @text 기본 재생 간격
 * @type number
 * @min 1
 * @desc 몇 글자마다 한 번씩 소리를 낼지. 1이면 매 글자마다.
 * @default 1
 *
 * @param DefaultLimit
 * @text 기본 최대 글자 수
 * @type number
 * @min -1
 * @desc 대사 앞부분 몇 글자까지만 소리를 낼지. -1이면 제한 없음(끝까지).
 * @default -1
 *
 * @param Polyphonic
 * @text 소리 겹침 허용
 * @type boolean
 * @on 허용 (여러 소리 동시 재생)
 * @off 허용 안 함 (항상 이전 소리를 끊고 재생)
 * @desc 꺼두면 새 소리가 날 때 이전 소리를 즉시 끊고 재생해서 절대
 * 겹치지 않습니다. 목소리/타이핑음은 꺼두는 걸 권장합니다.
 * @default false
 *
 * @param Enabled
 * @text 사용 여부
 * @type boolean
 * @on 사용
 * @off 사용 안 함
 * @default true
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * 대사창(Window_Message)에 얼굴 그림(\f<파일명> 또는 이벤트 명령의
 * "얼굴 그림")이 표시되어 있을 때, 그 얼굴 이미지 파일명 + 인덱스(같은
 * 파일 안에서 몇 번째 칸인지, 0~7)에 따라 서로 다른 타이핑 효과음을
 * 재생합니다. 예를 들어 애랜 얼굴이 떠 있으면 A 사운드, 계란 얼굴이면
 * B 사운드, 같은 애랜 얼굴이라도 인덱스(감정 표현)에 따라 다른 사운드를
 * 낼 수도 있습니다.
 *
 * ============================================================================
 * 등록 방법 - 전부 플러그인 파라미터로만 설정 (스크립트/코드 수정 불필요)
 * ============================================================================
 * "FaceSoundList" 파라미터에서 목록을 추가합니다. 각 항목:
 *   - FaceName  : img/faces 안의 얼굴 이미지 파일명 (확장자 제외)
 *   - FaceIndex : 그 파일 안에서의 칸 번호 (0~7). -1이면 인덱스 상관없이
 *                 그 파일이면 전부 일치.
 *   - Sound     : audio/se 안의 효과음 파일명 (확장자 제외)
 *   - Pan / Pitch / Volume / Interval / Limit : 사운드 세부 설정
 *     (비워두면 "Default..." 파라미터 값을 사용)
 *
 * 목록은 위에서부터 순서대로 검사해서 먼저 일치하는 항목 하나만 사용합니다.
 * (특정 인덱스만 지정한 항목을 FaceIndex=-1(전체 일치) 항목보다 위에
 * 두면 그 인덱스만 예외로 다른 사운드를 낼 수 있습니다.)
 *
 * 목록에 일치하는 항목이 없으면 "Default..." 파라미터들이 쓰이고,
 * DefaultSound가 비어 있으면 소리가 나지 않습니다.
 * 얼굴 그림 자체가 없는 대사(얼굴 없음)에도 Default가 적용됩니다.
 *
 * ============================================================================
 * 스크립트 호출 (선택 사항)
 * ============================================================================
 * FaceTextSound.setEnabled(true/false)  - 전체 켜기/끄기
 *
 * ============================================================================
 * 라이선스
 * ============================================================================
 * 자유롭게 사용, 수정하실 수 있습니다.
 */

/*~struct~FaceSound:
 * @param FaceName
 * @text 얼굴 파일명
 * @type string
 * @desc img/faces 폴더 기준 파일명 (확장자 제외)
 * @default
 *
 * @param FaceIndex
 * @text 얼굴 인덱스
 * @type number
 * @min -1
 * @max 7
 * @desc 그 파일 안에서의 칸 번호(0~7). -1이면 인덱스 상관없이 전체 일치.
 * @default -1
 *
 * @param Sound
 * @text 효과음 파일명
 * @type string
 * @desc audio/se 폴더 기준 파일명 (확장자 제외)
 * @default
 *
 * @param Pan
 * @text 팬
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @param Pitch
 * @text 피치
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param Volume
 * @text 볼륨
 * @type number
 * @min 0
 * @max 100
 * @default 80
 *
 * @param Interval
 * @text 재생 간격
 * @type number
 * @min 1
 * @default 1
 *
 * @param Limit
 * @text 최대 글자 수
 * @type number
 * @min -1
 * @default -1
 */

var Imported = Imported || {};
Imported.FaceTextSound = true;

var FaceTextSound = FaceTextSound || {};

(function () {
  'use strict';

  var parameters = PluginManager.parameters('FaceTextSound');

  var defaults = {
    sound: String(parameters['DefaultSound'] || ''),
    pan: Number(parameters['DefaultPan'] || 0),
    pitch: Number(parameters['DefaultPitch'] || 100),
    volume: Number(parameters['DefaultVolume'] || 80),
    interval: Math.max(1, Number(parameters['DefaultInterval'] || 1)),
    limit: Number(parameters['DefaultLimit']) || -1,
  };

  var enabled = String(parameters['Enabled'] || 'true') === 'true';
  var polyphonic = String(parameters['Polyphonic'] || 'false') === 'true';

  function parseList(json) {
    var list = [];
    JSON.parse(json || '[]').forEach(function (entryJson) {
      var e = JSON.parse(entryJson);
      list.push({
        faceName: String(e.FaceName || ''),
        faceIndex: e.FaceIndex === undefined || e.FaceIndex === ''
          ? -1
          : Number(e.FaceIndex),
        sound: String(e.Sound || ''),
        pan: e.Pan === undefined || e.Pan === '' ? defaults.pan : Number(e.Pan),
        pitch:
          e.Pitch === undefined || e.Pitch === ''
            ? defaults.pitch
            : Number(e.Pitch),
        volume:
          e.Volume === undefined || e.Volume === ''
            ? defaults.volume
            : Number(e.Volume),
        interval:
          e.Interval === undefined || e.Interval === ''
            ? defaults.interval
            : Math.max(1, Number(e.Interval)),
        limit:
          e.Limit === undefined || e.Limit === ''
            ? defaults.limit
            : Number(e.Limit),
      });
    });
    return list;
  }

  var faceSoundList = parseList(parameters['FaceSoundList']);

  function resolveOptions(faceName, faceIndex) {
    for (var i = 0; i < faceSoundList.length; i++) {
      var entry = faceSoundList[i];
      if (entry.faceName !== faceName) continue;
      if (entry.faceIndex !== -1 && entry.faceIndex !== faceIndex) continue;
      return entry;
    }
    // 일치하는 항목이 없으면 기본값 사용
    return {
      sound: defaults.sound,
      pan: defaults.pan,
      pitch: defaults.pitch,
      volume: defaults.volume,
      interval: defaults.interval,
      limit: defaults.limit,
    };
  }

  FaceTextSound.setEnabled = function (value) {
    enabled = !!value;
  };

  FaceTextSound.stop = function () {
    if (_monoBuffer) {
      _monoBuffer.stop();
      _monoBuffer = null;
    }
  };

  //---------------------------------------------------------------------------
  // 겹침 방지 재생 - Polyphonic이 꺼져 있으면(기본값) 이전 소리를 즉시
  // 끊고 재생해서, 타이핑 속도가 빨라도 절대 여러 소리가 겹치지 않습니다.
  //---------------------------------------------------------------------------
  var _monoBuffer = null;

  // 같은 파일명은 버퍼를 한 번만 로드해서 재사용합니다. 매 글자마다
  // createBuffer로 새로 로드하면, 파일 로딩이 채 끝나기 전에 다음 글자가
  // 이전 버퍼를 끊어버려서 특정 사운드(용량이 크거나 로딩이 느린 파일)가
  // 첫 재생 이후로 안 들리는 문제가 생길 수 있습니다.
  var _bufferCache = {};

  function getBuffer(name) {
    if (!_bufferCache[name]) {
      try {
        _bufferCache[name] = AudioManager.createBuffer('se', name);
      } catch (e) {
        console.warn('[FaceTextSound] 버퍼 로드 실패:', name, e);
        return null;
      }
    }
    return _bufferCache[name];
  }

  function playSound(se) {
    if (!se.name) return;

    var buffer = getBuffer(se.name);
    if (!buffer) return;

    if (!polyphonic) {
      if (_monoBuffer) {
        _monoBuffer.stop();
      }
      try {
        AudioManager.updateSeParameters(buffer, se);
        buffer.play(false);
        _monoBuffer = buffer;
      } catch (e) {
        console.warn('[FaceTextSound] 재생 실패:', se.name, e);
      }
      return;
    }

    // 겹침 허용 모드 - 기존 방식대로 재생
    AudioManager.playStaticSe(se);
  }

  //---------------------------------------------------------------------------
  // Window_Message
  //---------------------------------------------------------------------------
  var _Window_Message_newPage = Window_Message.prototype.newPage;
  Window_Message.prototype.newPage = function (textState) {
    _Window_Message_newPage.call(this, textState);

    // 얼굴/사운드 옵션은 여기서 미리 캐싱하지 않습니다. newPage 시점에는
    // $gameMessage의 얼굴 정보가 아직 이전 대사의 것으로 남아있는 경우가
    // 있어서(플러그인 처리 순서 등), 그대로 캐싱하면 가끔 이전 화자의
    // 사운드가 다음 대사 첫 글자에 재생되는 버그가 생깁니다.
    // 대신 글자를 찍는 시점마다 매번 최신 얼굴 정보를 다시 읽습니다.
    this._faceTextSound = {
      counter: 0,
    };

    // 새 대사가 시작될 때 이전 대사에서 이어지던 소리가 있으면 끊습니다.
    FaceTextSound.stop();
  };

  var _Window_Message_processNormalCharacter =
    Window_Message.prototype.processNormalCharacter;
  Window_Message.prototype.processNormalCharacter = function (textState) {
    _Window_Message_processNormalCharacter.call(this, textState);

    if (!enabled) return;
    var state = this._faceTextSound;
    if (!state) return;

    // 매 글자마다 현재 $gameMessage의 얼굴 정보를 새로 읽어서 옵션을 구합니다.
    var faceName = $gameMessage.faceName();
    var faceIndex = $gameMessage.faceIndex();
    var opt = resolveOptions(faceName, faceIndex);

    if (!opt.sound) return;

    var counter = state.counter++;
    var limit = opt.limit;
    var interval = opt.interval;

    if ((limit < 0 || counter < limit) && counter % interval === 0) {
      playSound({
        name: opt.sound,
        pan: opt.pan,
        pitch: opt.pitch,
        volume: opt.volume,
      });
    }
  };

  var _Window_Message_terminateMessage =
    Window_Message.prototype.terminateMessage;
  Window_Message.prototype.terminateMessage = function () {
    _Window_Message_terminateMessage.call(this);
    FaceTextSound.stop();
  };
})();
