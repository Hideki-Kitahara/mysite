/* ver.0.0.0 */
/*===============================================================================================================================*/
/* トークン取得                                                                                                                  */
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
 * 指定したテキスト(コメント削除済)からトークンリストを取得します。
 *
 * @param {string} inputText                - 入力ファイルの文字列(コメント削除済)
 * @returns {Array<Object>}                 - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                 - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                    - トークンの文字列 
 *     - {number} TokenListIndex            - トークンリストのインデックス
 */
/*===============================================================================================================================*/
function getToken(inputText) {
    let symbol = "";
    let tokenList = [];

    for (let i = 0; i < inputText.length; i++) {
        if ((inputText[i] == "+")  || (inputText[i] == "-" )                 // 1文字リテラルなら
         || (inputText[i] == "*")  || (inputText[i] == "/" )
         || (inputText[i] == "%")  || (inputText[i] == "#" )
         || (inputText[i] == "\\") || (inputText[i] == "$" )
         || (inputText[i] == ".")  || (inputText[i] == "," )
         || (inputText[i] == "\'") || (inputText[i] == "\"")
         || (inputText[i] == "!")  || (inputText[i] == "?" )
         || (inputText[i] == "|")  || (inputText[i] == "&" )
         || (inputText[i] == "\:") || (inputText[i] == "\;")
         || (inputText[i] == "^")  || (inputText[i] == "~" )
         || (inputText[i] == "=")  || (inputText[i] == "@" )
         || (inputText[i] == "<")  || (inputText[i] == ">" )
         || (inputText[i] == "[")  || (inputText[i] == "]" )
         || (inputText[i] == "{")  || (inputText[i] == "}" )
         || (inputText[i] == "(")  || (inputText[i] == ")" )) {
            let tokenNode = {
                "TokenType"      : TOKEN_IDENTIFIRE,
                "String"         : inputText[i],
                "TokenListIndex" : tokenList.length
            }
            tokenList.push(tokenNode);
        }
        else {
            let result;

            result = inputText[i].match(/[A-Za-z0-9_]/);
            if (result != null){                                             // 英数文字orアンダーバー(_)の文字列なら
                symbol += inputText[i];
            }
            
            if ((i + 1) < inputText.length){
                result = inputText[i+1].match(/[A-Za-z0-9_]/);
            }
            else {
                result = null;
            }

            if ((result == null) && (symbol.length > 0)) {                  // 英数文字orアンダーバー(_)の文字列の終端なら
                let tokenNode = {
                    "TokenType"      : TOKEN_IDENTIFIRE,
                    "String"         : symbol,
                    "TokenListIndex" : tokenList.length
                }
                tokenList.push(tokenNode);
                symbol = "";
            }
        }
    }
    
    getReservWord(tokenList);
    
    return tokenList;
}

/*===============================================================================================================================*/
/**
 * トークンリスト内の予約語を判別するヘルパー関数。
 *
 * @param {Array<Object>} tokenList         - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                 - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                    - トークンの文字列 
 *     - {number} TokenListIndex            - トークンリストのインデックス
 */
/*===============================================================================================================================*/
function getReservWord(tokenList) {

    for (let i = 0; i < tokenList.length; i++) {
        for (let j = 0; j < s_TOKEN_MAP.length; j++) {
            if (tokenList[i].String == s_TOKEN_MAP[j].symbol){
                tokenList[i].TokenType = s_TOKEN_MAP[j].type;
            }
        }
    }
}

/*===============================================================================================================================*/
/**
 * トークンリストをHTMLテーブルに表示します。
 *
 * @param {Array<Object>} tokenList         - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                 - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                    - トークンの文字列 
 *     - {number} TokenListIndex            - トークンリストのインデックス
 * @param {string} tableId                  - 表示先のHTMLテーブル要素のID
 */
/*===============================================================================================================================*/
function displayTokenElementsInTable(tokenElements, tableId) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        console.error(`ID "${tableId}" を持つテーブル要素が見つかりません。`);
        return;
    }

    // 以前の内容をクリアし、ヘッダーを設定
    tableElement.innerHTML = `
        <thead>
            <tr>
                <th>TokenType</th>
                <th>String</th>
                <th>TokenListIndex</th>
            </tr>
        </thead>
        <tbody>
        </tbody>`;

    const tableBody = tableElement.querySelector('tbody');

    // テーブル行を生成
    for (const element of tokenElements) {
        const row = tableBody.insertRow();

        const cell1 = row.insertCell();
        cell1.textContent = s_TOKEN_MAP[element.TokenType].type_name;

        const cell2 = row.insertCell();
        cell2.textContent = element.String;

        const cell3 = row.insertCell();
        cell3.textContent = element.TokenListIndex;
    }     
}

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2025/01/24 : 北原英樹 : 新規作成                                                                                 */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/
