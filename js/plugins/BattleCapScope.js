//=============================================================================
// BattleCapScope.js
//=============================================================================

/*:
 * @plugindesc 전투 파티원 최대 인원 제한(BattlePartyChange)을 전투 중에만 적용하고, 맵에서는 더 많은 인원을 유지합니다.
 * @author Claude
 *
 * @param Map Max Members
 * @desc 맵(전투 밖)에서 유지할 파티 최대 인원. 0이면 엔진/다른 플러그인이 정한 원래 값을 그대로 사용.
 * @type number
 * @min 0
 * @default 7
 *
 * @param Fix Followers
 * @desc 팔로워(맵에서 따라다니는 파티원) 수가 모자라면 Map Max Members 에 맞춰 자동으로 늘립니다. (기존 세이브 대응)
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * 개요
 * ============================================================================
 * BattlePartyChange.js 의 "전투 파티원 최대 인원"(기본 4)은 파티 정원 자체를
 * 줄여버려서 맵에서도 파티원이 4명까지만 보였습니다.
 * 이 플러그인은 그 제한을 "전투 중(전투 씬)"에만 적용합니다.
 *
 *   전투 중  : BattlePartyChange 의 제한(예: 4명)
 *   그 밖(맵): Map Max Members (기본 7명) 또는 원래 값
 *
 * 팔로워 수는 게임을 시작할 때 정해지기 때문에, 이미 만든 세이브는 팔로워가
 * 모자랄 수 있습니다. Fix Followers 가 켜져 있으면 맵에 들어올 때 부족한
 * 팔로워를 자동으로 추가합니다. (줄이지는 않습니다)
 *
 * ============================================================================
 * 플러그인 순서 (중요)
 * ============================================================================
 * 이 플러그인을 BattlePartyChange.js 의 "바로 위"에 두세요.
 * (YEP 계열 등 정원 관련 플러그인보다는 아래)
 *
 *   ...YEP 계열
 *   BattleCapScope        <- 여기
 *   BattlePartyChange     <- 바로 아래
 *
 * BattlePartyChange 가 정원 함수를 덮어쓰는 순간을 가로채는 방식이라
 * 순서가 반대이면 동작하지 않습니다. 파일 이름은 BattleCapScope.js 여야 합니다.
 *
 * 이용 약관: 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var P = PluginManager.parameters('BattleCapScope');
    var mapMax = Number(P['Map Max Members'] === undefined ? 7 : P['Map Max Members']);
    var fixFollowers = String(P['Fix Followers'] === undefined ? 'true' : P['Fix Followers']) === 'true';

    // 전투 씬이 열려 있는 동안에만 제한 적용.
    // ($gameParty.inBattle() 은 전투가 끝난 뒤에도 true 로 남는 경우가 있어 쓰지 않음)
    function inBattleScope() {
        return typeof Scene_Battle !== 'undefined' && SceneManager._scene instanceof Scene_Battle;
    }

    var proto = Game_Party.prototype;
    var uncapped = proto.maxBattleMembers;   // 이 시점(BattlePartyChange 로드 전)의 원래 함수
    var capped = null;                       // BattlePartyChange 가 덮어쓰면 여기에 담김

    function outsideBattleValue() {
        var v = uncapped.call(this);
        return mapMax > 0 ? mapMax : v;
    }

    function scoped() {
        if (capped && inBattleScope()) return capped.call(this);
        return outsideBattleValue.call(this);
    }

    // BattlePartyChange 는 먼저 "읽고"(원본 확보) 그다음 "덮어씀".
    // 읽을 때는 원본을 그대로 돌려줘서 그쪽의 제한 함수가 원본 기준으로 만들어지게 하고,
    // 덮어쓸 때는 그 제한 함수를 capped 에 보관한 뒤 전투 중에만 쓰도록 한다.
    var outer = null; // 이후에 로드된 다른 플러그인이 다시 덮어쓴 함수 (이미 scoped 를 감싸고 있음)

    Object.defineProperty(proto, 'maxBattleMembers', {
        configurable: true,
        enumerable: true,
        get: function() { return outer || (capped ? scoped : uncapped); },
        set: function(fn) {
            if (!capped) capped = fn;   // 첫 덮어쓰기 = BattlePartyChange 의 제한 함수
            else outer = fn;            // 그 뒤의 덮어쓰기는 scoped 를 감싼 함수이므로 그대로 사용
        }
    });

    // 팔로워 수 보정 (기존 세이브 대응)
    if (fixFollowers) {
        var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
        Scene_Map.prototype.onMapLoaded = function() {
            ensureFollowers();
            _Scene_Map_onMapLoaded.apply(this, arguments);
        };
    }

    // 테스트 플레이: 전투에서 맵으로 돌아온 직후 상태를 F8 콘솔에 출력
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.apply(this, arguments);
        if (Utils.isOptionValid('test') && SceneManager.isPreviousScene(Scene_Battle)) {
            console.log('[BattleCapScope] 맵 복귀 직후 → 정원:', $gameParty.maxBattleMembers(),
                '/ 전투멤버:', $gameParty.battleMembers().length,
                '/ 전체 파티:', $gameParty.allMembers().length,
                '/ 팔로워 수:', $gamePlayer.followers()._data.length,
                '/ inBattle():', $gameParty.inBattle());
        }
    };

    function ensureFollowers() {
        if (!$gamePlayer || !$gameParty) return;
        var followers = $gamePlayer.followers();
        if (!followers || !followers._data) return;
        var need = $gameParty.maxBattleMembers() - 1;
        var added = false;
        while (followers._data.length < need) {
            followers._data.push(new Game_Follower(followers._data.length + 1));
            added = true;
        }
        if (added) {
            followers.synchronize($gamePlayer.x, $gamePlayer.y, $gamePlayer.direction());
            $gamePlayer.refresh();
        }
    }

})();
