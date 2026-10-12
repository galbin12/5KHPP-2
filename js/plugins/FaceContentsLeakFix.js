//=============================================================================
// FaceContentsLeakFix.js
//=============================================================================

/*:
 * @plugindesc YEP_BattleStatusWindow의 createFaceContents가 전투에 들어갈
 * 때마다 예전 얼굴용 Sprite(_faceContents)를 제거하지 않고 새로 만들어서
 * 계속 쌓이는 버그를 고칩니다. (세이브 후 여러 번 전투 시 옛날 프레임이
 * 새 프레임 밑에 겹쳐 보이는 증상 수정)
 * @author Custom
 *
 * @help
 * ============================================================================
 * 설명
 * ============================================================================
 * Window_BattleStatus.prototype.createFaceContents 는 전투 씬이 새로
 * 생성될 때마다 얼굴 애니메이션용 Sprite(this._faceContents)를 새로
 * 만들어서 addChildAt으로 붙입니다. 그런데 이전 전투에서 쓰던
 * _faceContents는 그대로 window의 자식으로 남아있어서, 전투를 여러 번
 * 치를수록 얼굴 스프라이트가 계속 누적됩니다.
 *
 * 오래된 스프라이트일수록 먼저 그려진(오래된) 애니메이션 프레임 이미지가
 * 그대로 남아있고, 그 위에 새 스프라이트가 겹쳐 그려지기 때문에
 * "첫 프레임이 다른 프레임을 덮고 있는" 것처럼 보이는 증상이 발생합니다.
 *
 * 이 플러그인은 createFaceContents 실행 전에, 기존에 남아있는
 * _faceContents(및 동일 크기의 orphan 스프라이트들)를 모두
 * removeChild로 제거한 뒤 새로 만들도록 합니다.
 *
 * ============================================================================
 * 플러그인 순서
 * ============================================================================
 * YEP_BattleStatusWindow.js, Popp_BStatusAnimatedFace.js 보다 아래
 * (맨 아래쪽)에 두세요.
 *
 * ============================================================================
 * 이용 약관
 * ============================================================================
 * 자유롭게 수정 및 사용 가능합니다.
 */

(function() {
    'use strict';

    var _Window_BattleStatus_createFaceContents =
        Window_BattleStatus.prototype.createFaceContents;

    Window_BattleStatus.prototype.createFaceContents = function() {
        // 이번 인스턴스가 이미 들고 있던 얼굴용 스프라이트 참조만 제거.
        // (크기로 추측해서 지우는 방식은 다른 UI 스프라이트까지 잘못
        // 지울 위험이 있어 사용하지 않음)
        if (this._faceContents) {
            this.removeChild(this._faceContents);
            this._faceContents = null;
        }

        _Window_BattleStatus_createFaceContents.call(this);
    };

})();
