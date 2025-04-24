/* ver.0.0.0 */
/*===============================================================================================================================*/
/* C言語解析ツール                                                                                                               */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/
/*===============================================================================================================================*/
/* ページ読み込みイベント                                                                                                        */
/*===============================================================================================================================*/
window.addEventListener('load', () => {

//    ↓ github pagesでうまく動かないため暫定で非実装、代わりにhtmlページに値直打ち
//    setPlantUMLServer("ID_RADIO_0_INPUT_TEXT", "ID_RADIO_1_LABEL");

    // ファイル読み込み時
    const fileElement = document.getElementById('ID_InputFile');

    fileElement.addEventListener('change', evt => {
        let inputData = evt.target;
        
        if (inputData.files.length == 0) {
            console.log('No file selected');
            return;
        }

        const file   = inputData.files[0];
        const reader = new FileReader();
    
        // ファイル内容の読み込み(f_reader.readAsText)が正常に完了した際、コールされる
        reader.onload = () => {
            /******************************************************/
            /* 表示用のhtml要素の初期化                           */
            /******************************************************/
            document.getElementById("ID_SequenceDiagram_View_Area").innerHTML  = "";

            /***************************/
            /* コメント削除処理        */
            /***************************/
            let nonComentText = deleteComent(event.target.result);

            /***************************/
            /* 	トークン抽出           */
            /***************************/
            let tokenList = getToken(nonComentText);

            /***************************/
            /* 関数定義抽出            */
            /***************************/
            let funcDecList = getFuncDeclaration(tokenList);

            /***************************/
            /* 制御文リスト抽出        */
            /***************************/
            let statementList = [];
            for (let i = 0; i < funcDecList.length; i++) {
                let   tokenListPart     = tokenList.slice(funcDecList[i].TokenList_StartIndex, funcDecList[i].TokenList_EndIndex);
                const statementListPart = getStatementList(tokenListPart);

                for (let j = 0; j < statementListPart.length; j++) {
                    statementList.push(statementListPart[j]);
                }
            }

            /***************************/
            /* シーケンス図:PlantUML   */
            /***************************/
            drawSequenceArea(funcDecList, statementList);
        };

        // ファイル内容読み込み実施
        reader.readAsText(file);
    });
});

/*===============================================================================================================================*/
/**
 * 関数定義リストに登録された関数に対するシーケンス図を描画します。
 *
 * @param {Array<Object>} funcDecList       - 関数定義のリスト
 *     - { Funcname, TokenList_StartIndex, TokenList_EndIndex } の配列
 *     - {string} Funcname                  - 関数名
 *     - {number} TokenList_StartIndex      - トークンリスト内の開始インデックス
 *     - {number} TokenList_EndIndex        - トークンリスト内の終了インデックス
 * @param {Array<Object>} statementList     - ステートメントのリスト
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                      - ステートメントのタイプ (例: "if", "else", "for")
 *     - {string} Statement                 - ステートメントのテキスト (例: 条件、関数名)
 *     - {number} TokenListIndex            - 元のトークンリスト内のインデックス
 */
/*===============================================================================================================================*/
function drawSequenceArea(funcDecList, statementList) {

    /*******************************************************/
    /* シーケンス表示        ID_SequenceDiagram_View_Area  */
    /*******************************************************/
    for (let i = 0; i < funcDecList.length; i++) {
        const sequenceArea = document.getElementById('ID_SequenceDiagram_View_Area');

        /*******************************************************/
        /* シーケンス図:PlantUMLを作成                         */
        /*******************************************************/
        const sequenceDiagram = generateSequenceDiagram(funcDecList, statementList, funcDecList[i].Funcname);
        const sequenceImg = document.createElement('img');
        sequenceImg.src = getPlantUMLServer('ID_RADIO_0', 'ID_RADIO_0_INPUT_TEXT') + plantumlEncoder.encode(sequenceDiagram);
        
        sequenceArea.appendChild(document.createElement('br'));
        sequenceArea.appendChild(sequenceImg);

        /*******************************************************/
        /* ボタン(PlantUMLコード出力)を作成                    */
        /*   ID : ID_SequenceDiagram_Out_Btn_0, _1, _2, ・・・ */
        /*******************************************************/
        sequenceArea.appendChild(document.createElement('br'));
        const newButton = document.createElement('button');
        newButton.textContent = funcDecList[i].Funcname + ":PlantUMLコードをファイルに出力";
        newButton.id = "ID_SequenceDiagram_Out_Btn" + i;
        sequenceArea.appendChild(newButton);

        /*******************************************************/
        /* PlantUMLコードを表示                                */
        /*   ID    : ID_SequenceDiagram_0, _1, _2, ・・・      */
        /*   Class : SorceCode                                 */
        /*******************************************************/
        const sequenceText     = document.createElement('p');
        sequenceText.id        = "ID_SequenceDiagram_" + i;
        sequenceText.className = "SorceCode";                        // 結果表示(html上で表示できない文字列を一部置き換え)
        sequenceText.innerHTML = sequenceDiagram
                                     .replace(/</g,   "&lt;"  )
                                     .replace(/\n/g,  "<br>"  )
                                     .replace(/ /g,   "&nbsp;")
                                     .replace(/\t/g,  "&emsp;")
                                     .replace(/&reg/g,"＆reg" );      // 半角の&を全角の＆で仮表示
        sequenceArea.appendChild(sequenceText);                       // 末尾に挿入
        sequenceArea.appendChild(document.createElement('br'));

        /*******************************************************/
        /* ボタン(PlantUMLコード出力)押下時の動作定義          */
        /*   xxx.puファイルにコード出力    xxx = (関数名)      */
        /*                                                     */
        /*   ID : ID_SequenceDiagram_Out_Btn_0, _1, _2, ・・・ */
        /*******************************************************/
        const btn = document.getElementById("ID_SequenceDiagram_Out_Btn" + i);
        btn.addEventListener('click', () => {
            const sequenceDiagram_out_txt = document.getElementById("ID_SequenceDiagram_" + i);
            let   text = sequenceDiagram_out_txt.innerHTML           // html上で表示するために置き換えた文字列を戻す
                         .replace(/&lt;/g,   "<"   )
                         .replace(/&gt;/g,   ">"   )
                         .replace(/<br>/g,   "\n"  )
                         .replace(/&nbsp;/g, " "   )
                         .replace(/&emsp;/g, "\t"  )
                         .replace(/＆reg/g,  "&reg");                // 全角の＆で仮表示した&を半角の&に戻す

            const blob = new Blob([text], {type: "text/plain"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = funcDecList[i].Funcname + ".pu";
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2024/11/20 : 北原英樹 : 新規作成                                                                                 */
/*            : 2025/03/28 : 北原英樹 : シーケンス図表示機能以外を削除                                                           */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/

