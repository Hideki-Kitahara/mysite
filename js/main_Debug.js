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
            /***************************/
            /* コメント削除処理        */
            /***************************/
            let nonComentText = deleteComent(event.target.result);

            /******************************************************/
            /* 結果表示(html上で表示できない文字列を一部置き換え) */
            /******************************************************/
            const preText = document.getElementById('ID_InputData');
            preText.innerHTML = nonComentText
                                  .replace(/</g,    "&lt;"   )
                                  .replace(/\n/g,   "<br>"   )
                                  .replace(/ /g,    "&nbsp;" )
                                  .replace(/\t/g,   "&emsp;" )
                                  .replace(/&reg/g, "＆reg"  );

            /***************************/
            /* 	トークン抽出           */
            /***************************/
            let tokenList = getToken(nonComentText);

            /***************************/
            /* 	トークン表示           */
            /***************************/
            displayTokenElementsInTable(tokenList, 'ID_TokenTbl');

            /***************************/
            /* 関数定義抽出            */
            /***************************/
            let funcDecList = getFuncDeclaration(tokenList);

            /***************************/
            /* 	関数定義箇所表示       */
            /***************************/
            displayFuncDeclarationElementsInTable(funcDecList, 'ID_FuncDeclarationList');

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
            /* 制御文リスト表示        */
            /***************************/
            displayStatementElementsInTable(statementList, 'ID_StatementList');

            /***************************/
            /* 分岐リスト表示          */
            /***************************/
            let pumlBranchList = getPlantumlBranchElements(statementList);
            displaySequenceElementsInTable(pumlBranchList, 'ID_PumlBrunchList');

            /***************************/
            /* シーケンスリスト表示    */
            /***************************/
            let pumlSequenceList = [];
            for (let i = 0; i < funcDecList.length; i++) {
                let sequenceListPart = getPlantumlSequenceForFunc(statementList, funcDecList, funcDecList[i].Funcname);

                for (let j = 0; j < sequenceListPart.length; j++) {
                    pumlSequenceList.push(sequenceListPart[j]);
                }
            }
            displaySequenceElementsInTable(pumlSequenceList, 'ID_PumlSequenceList');
        };

        // ファイル内容読み込み実施
        reader.readAsText(file);
    });
});

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2024/11/20 : 北原英樹 : 新規作成                                                                                 */
/*            : 2025/03/28 : 北原英樹 : デバッグ用に途中データ表示機能だけ残し、他表示機能は別ファイルに分離                     */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/

