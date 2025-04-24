/* ver.0.0.0 */
/*===============================================================================================================================*/
/* 関数定義取得                                                                                                                  */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/
/*===============================================================================================================================*/
/* 定数宣言                                                                                                                      */
/*                                                                                                                               */
/*===============================================================================================================================*/

/*===============================================================================================================================*/
/* 変数宣言                                                                                                                      */
/*                                                                                                                               */
/*===============================================================================================================================*/

/*===============================================================================================================================*/
/* 関数宣言                                                                                                                      */
/*                                                                                                                               */
/*===============================================================================================================================*/
/*===============================================================================================================================*/
/**
 * 関数定義のリストを取得します。  <関数定義> ::=  <関数名> "(" <引数> ")" "{" <文> "}"
 * 
 * @param {Array<Object>} tokenList           - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @returns {Array<Object>}                   関数定義のリスト
 *     - { Funcname, TokenList_StartIndex, TokenList_EndIndex } の配列
 *     - {string} Funcname                    - 関数名
 *     - {number} TokenList_StartIndex        - 関数定義の開始位置(トークンリスト内の開始インデックス)
 *     - {number} TokenList_EndIndex          - 関数定義の終了位置(トークンリスト内の終了インデックス)
 */
/*===============================================================================================================================*/
function getFuncDeclaration(tokenList) {
    let funcDecLists = [];
    let currentIndex = 0;

    while (currentIndex < tokenList.length) {
        let currentToken = tokenList[currentIndex];
        let nextToken    = 0;

        if (currentIndex < tokenList.length - 1) {
            nextToken = tokenList[currentIndex + 1];
        }
        else {
            // トークンリスト終端のため中断する
            break;
        }

        let funcNameStr  = "";
        let startIndex   = 0;    
        // 識別子 + "(" の組み合わせを関数として読み込み開始
        if ( (currentToken.TokenType === TOKEN_IDENTIFIRE) && (nextToken.TokenType === TOKEN_PARENTHESES_OPEN) ) {
            funcNameStr = currentToken.String;
            startIndex  = currentIndex;
            let nestLevel    = 0;

            // ")"まで読み込む
            while (currentIndex < tokenList.length) {
                currentToken = tokenList[currentIndex];
     
                if (currentToken.TokenType === TOKEN_PARENTHESES_OPEN) {       // "("
                    nestLevel++;
                }
                else if (currentToken.TokenType === TOKEN_PARENTHESES_CLOSE) { // ")"
                    if (nestLevel == 1) {        // 識別子(xxx)まで読み込みめたなら
                        currentIndex++;          // 読み込み位置を進めてループを抜ける
                        break;
                    }
                    else if (nestLevel > 1) {    // ネストされた"("に対応する")"
                        nestLevel--;
                    }
                    else {
                        // { のネストが0以下(ありえない状態)の場合はエラー通知 かつ 読み込みデータをクリアして中断する
                        console.error("Mismatched parentheses in condition starting near index:", currentIndex);
                        funcNameStr = "";
                        startIndex  = 0;
                 
                        break;
                    }
                }
                else {
                    /* 何もしない */
                }
                currentIndex++;
            }

            if (currentIndex < tokenList.length) {
                currentToken = tokenList[currentIndex]; 
            }
            else {
                // トークンリスト終端のため中断する
                break;
            }

            // 識別子(xxx) まで読みこみ正常 かつ 次トークンが"{"なら読み進める
            if ( (nestLevel === 1) && (currentIndex < tokenList.length) && (currentToken.TokenType === TOKEN_BRACES_OPEN) ) {
                nestLevel = 0;

                // "}"まで読み込む
                while (currentIndex < tokenList.length) {
                    currentToken = tokenList[currentIndex];

                    if (currentToken.TokenType == TOKEN_BRACES_OPEN) {         // "{"
                        nestLevel++;
                    }
                    else if (currentToken.TokenType == TOKEN_BRACES_CLOSE) {   // "}"
                        if (nestLevel == 1) {                                  // 識別子(xxx){xxx}まで読み込みめたなら
                            funcDecLists.push({                                // 関数定義として登録する
                                "Funcname"             : funcNameStr,
                                "TokenList_StartIndex" : startIndex,
                                "TokenList_EndIndex"   : currentIndex
                            });
                            break;
                        }
                        else if (nestLevel >= 2) {      // ネストされた"{"に対応する"}"
                            nestLevel--;
                        }
                        else {
                            // { のネストが0以下(ありえない状態)の場合はエラー通知 かつ 読み込みデータをクリアして中断する
                            console.error("Mismatched parentheses in condition starting near index:", currentIndex);
                            funcNameStr = "";
                            startIndex  = 0;
                            break;
                        }
                    }
                    else {
                        /* 何もしない */
                    }
                    currentIndex++;
                }
            }
            else {
                // 関数定義ではないため 読み込みデータをクリアして関数定義開始を探索しなおす
                funcNameStr = "";
                startIndex  = 0;
            }
        }

        currentIndex++;
    }

    return funcDecLists;
}

/*===============================================================================================================================*/
/**
 * 関数定義のリストをHTMLテーブルに表示します。
 *
 * @param {Array<Object>} statementElements - 関数定義のリスト
 *     - { Funcname, TokenList_StartIndex, TokenList_EndIndex } の配列
 *     - {string} Funcname                  - 定義関数名
 *     - {string} TokenList_StartIndex      - 関数定義の開始位置(元のトークンリスト内のインデックス)    
 *     - {number} TokenList_EndIndex        - 関数定義の終了位置(元のトークンリスト内のインデックス) 
 * @param {string} tableId                  - 表示先のHTMLテーブル要素のID
 */
/*===============================================================================================================================*/
function displayFuncDeclarationElementsInTable(funcDeclarationElements, tableId) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        console.error(`ID "${tableId}" を持つテーブル要素が見つかりません。`);
        return;
    }

    // 以前の内容をクリアし、ヘッダーを設定
    tableElement.innerHTML = `
        <thead>
            <tr>
                <th>Funcname</th>
                <th>TokenList_StartIndex</th>
                <th>TokenList_EndIndex</th>
            </tr>
        </thead>
        <tbody>
        </tbody>`;

    const tableBody = tableElement.querySelector('tbody');

    // テーブル行を生成
    for (const element of funcDeclarationElements) {
        const row = tableBody.insertRow();

        const cell1 = row.insertCell();
        cell1.textContent = element.Funcname;

        const cell2 = row.insertCell();
        cell2.textContent = element.TokenList_StartIndex;

        const cell3 = row.insertCell();
        cell3.textContent = element.TokenList_EndIndex;
    }
        
}

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2025/01/30 : 北原英樹 : 新規作成                                                                                 */
/*            : 2025/04/24 : 北原英樹 : 状態遷移によるスキャナ実装を廃止                                                         */
/*                                                                                                                               */
/*===============================================================================================================================*/
