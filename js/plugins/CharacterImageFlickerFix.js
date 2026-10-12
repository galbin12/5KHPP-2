//=============================================================================
// CharacterImageFlickerFix.js
//=============================================================================

/*:
 * @plugindesc 이동루트로 캐릭터 이미지를 바꿀 때 로드 중 잠깐 비어보이거나
 * 다른 캐릭터가 겹쳐 보이는 현상을 막습니다.
 * @author Claude
 *
 * @help
 * 이동루트의 "이미지 변경"으로 캐릭터 그래픽을 바꾸면, 새 이미지가 완전히
 * 로드되기 전까지 스프라이트가 빈 프레임으로 표시되거나, 옛 이미지에
 * 새 캐릭터의 인덱스/셀 크기가 적용되어 다른 캐릭터가 잠깐 보이는
 * 문제가 있었습니다. (RPG Maker MV 코어는 이미지 로딩 여부와 상관없이
 * 캐릭터 이름/인덱스를 스프라이트에 즉시 반영하기 때문입니다.)
 *
 * 이 플러그인은 새 이미지 로드가 끝날 때까지는 화면에 "실제로 표시 중인"
 * 이름/인덱스/비트맵을 모두 기존 상태로 유지하다가, 로드가 완전히
 * 끝난 순간에만 한 번에 통째로 교체해서 깜빡임/오표시 현상을 없애줍니다.
 *
 * 플러그인 커맨드 없음. 그냥 켜두기만 하면 적용됩니다.
 * (타일 캐릭터로 설정된 경우는 원래 로직 그대로 동작합니다.)
 *
 * RS_CustomCharacterSize.js 등 this._characterName / this._characterIndex를
 * 참조해서 셀 크기나 프레임을 계산하는 플러그인과도 자연스럽게 호환됩니다.
 * (이 플러그인이 그 값들을 "실제 표시 시점"에만 갱신해주기 때문)
 */

(function() {

    //-------------------------------------------------------------------
    // 변경 감지는 "대기 중(pending)" 이름/인덱스로, 실제 표시값
    // (this._characterName / this._characterIndex)은 이미지 교체가
    // 끝난 시점에만 갱신합니다.
    //-------------------------------------------------------------------
    Sprite_Character.prototype.isImageChanged = function() {
        return (this._tilesetId !== $gameMap.tilesetId() ||
                this._tileId !== this._character.tileId() ||
                this._pendingCharacterName !== this._character.characterName() ||
                this._pendingCharacterIndex !== this._character.characterIndex());
    };

    Sprite_Character.prototype.updateBitmap = function() {
        if (this.isImageChanged()) {
            this._tilesetId = $gameMap.tilesetId();
            this._tileId = this._character.tileId();
            this._pendingCharacterName = this._character.characterName();
            this._pendingCharacterIndex = this._character.characterIndex();
            if (this._tileId > 0) {
                this.setTileBitmap();
            } else {
                this.setCharacterBitmap();
            }
        }
    };

    Sprite_Character.prototype.setCharacterBitmap = function() {
        var targetName = this._pendingCharacterName;
        var targetIndex = this._pendingCharacterIndex;
        var newBitmap = ImageManager.loadCharacter(targetName);
        var sprite = this;

        var applyBitmap = function() {
            sprite.bitmap = newBitmap;
            sprite._isBigCharacter = ImageManager.isBigCharacter(targetName);
            // 화면에 실제로 반영되는 시점에만 이름/인덱스 갱신
            // (patternWidth/Height, characterBlockX/Y 등이 이 값을 참조함)
            sprite._characterName = targetName;
            sprite._characterIndex = targetIndex;
        };

        if (newBitmap.isReady()) {
            // 이미 캐시에 있으면 기존 동작과 동일하게 즉시 반영
            applyBitmap();
        } else {
            // 로드가 끝날 때까지는 표시 중인 비트맵/이름/인덱스를 그대로 유지
            newBitmap.addLoadListener(function() {
                // 로드되는 동안 캐릭터 이미지가 또 바뀌었을 수 있으니 확인
                if (targetName === sprite._character.characterName()) {
                    applyBitmap();
                }
            });
        }
    };

    //-------------------------------------------------------------------
    // 프레임 절단 위치 계산 시 라이브 인덱스 대신 "표시 중인" 인덱스
    // (this._characterIndex, 위에서 실제 교체 시점에만 갱신됨)를 사용
    //-------------------------------------------------------------------
    Sprite_Character.prototype.characterBlockX = function() {
        if (this.isBigCharacter()) {
            return 0;
        } else {
            var index = this._characterIndex || 0;
            return index % 4 * 3;
        }
    };

    Sprite_Character.prototype.characterBlockY = function() {
        if (this.isBigCharacter()) {
            return 0;
        } else {
            var index = this._characterIndex || 0;
            return Math.floor(index / 4) * 4;
        }
    };

}());
