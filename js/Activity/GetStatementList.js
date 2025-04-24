/* ver.0.0.0 */
/*===============================================================================================================================*/
/* ステートメントリスト取得                                                                                                      */
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
 * トークンリストからステートメント要素のリスト作成します。
 *
 * @param {Array<Object>} tokenLists        - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                 - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                    - トークンの文字列 
 *     - {number} TokenListIndex            - トークンリストのインデックス
 * @returns {Array<Object>}                 ステートメント要素のリスト
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                      - ステートメントのタイプ (例: "if", "for", "Statement")
 *     - {string} Statement                 - ステートメントのテキスト (例: 条件文、処理文)
 *     - {number} TokenListIndex            - 元のトークンリスト内のインデックス
 */
/*===============================================================================================================================*/
function getStatementList(tokenLists) {
    let statementList = [];

    // 関数名と引数の処理
    const funcInfo = extractFunctionInfo(tokenLists);
    statementList.push(...funcInfo.statements);
    let currentIndex = funcInfo.nextIndex + 1;
 
    while (currentIndex < tokenLists.length) {
        const token = tokenLists[currentIndex];
        let processResult;

        switch (token.TokenType) {
            case TOKEN_IF:
                processResult = processIfStatement(tokenLists, currentIndex);
                break;

            case TOKEN_SWITCH:
                processResult = processSwitchStatement(tokenLists, currentIndex);
                break;

            case TOKEN_WHILE:
                processResult = processWhileStatement(tokenLists, currentIndex);
                break;

            case TOKEN_FOR:
                processResult = processForStatement(tokenLists, currentIndex);
                break;

            case TOKEN_ELSE:
                processResult = processElseStatement(tokenLists, currentIndex);
                break;

            case TOKEN_BREAK:
                processResult = processBreakStatement(tokenLists, currentIndex);
                break;

            case TOKEN_CASE:
            case TOKEN_DEFAULT:
                processResult = processCaseOrDefaultStatement(tokenLists, currentIndex);
                break;

            case TOKEN_RETURN:
                processResult = processReturnStatement(tokenLists, currentIndex);
                break;

            case TOKEN_BRACES_OPEN:
            case TOKEN_BRACES_CLOSE:
                processResult = processBrace(tokenLists, currentIndex);
                break;

            case TOKEN_SEMICOLON: // セミコロン単独(空処理として";"のみで実装するケース向け)
                 processResult = processSemicolon(tokenLists, currentIndex);
                 break;
                 
            default:
                // 通常のステートメント処理
                processResult = processRegularStatement(tokenLists, currentIndex);
                break;
        }

        if (processResult) {
            statementList.push(...processResult.statements);
            currentIndex = processResult.nextIndex; // 次の処理開始インデックスを更新
        }
        else {
            // エラー:予期しないトークン
            console.error("Unexpected token or processing error at index:", currentIndex, token);
            break;
        }
    }

    // ソート
    statementList.sort((a, b) => a.TokenListIndex - b.TokenListIndex);

    // Switch文の調整
    statementList = adjustSwitchStatement(statementList);
    statementList = addFallThroughStatement(statementList);

    return statementList;
}

/*===============================================================================================================================*/
/**
 * 関数名・引数のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @returns {Object}                          関数名・引数のステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - IFのステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "if", "End_if")
 *       - {string} statements.Statement      - ステートメントのテキスト (if文の条件文)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function extractFunctionInfo(tokenList) {
    const statements = [];
    let currentIndex = 0;

    // 関数名書き出し
    statements.push({
        "Type"           : "==FuncName==",
        "Statement"      : tokenList[currentIndex].String,
        "TokenListIndex" : tokenList[currentIndex].TokenListIndex
    });

    currentIndex++;

    // 引数宣言書き出し
    const conditionResult = extractConditionString(tokenList, currentIndex);
    statements.push({
        "Type"           : "==Argument==",
        "Statement"      : conditionResult.conditionText,
        "TokenListIndex" : tokenList[currentIndex].TokenListIndex
    });

    if (currentIndex < conditionResult.lastTokenIndex) {
        currentIndex = conditionResult.lastTokenIndex;
    }

    return {
        statements : statements,
        nextIndex  : currentIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * if文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          ifのステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - ifのステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "if", "End_if")
 *       - {string} statements.Statement      - ステートメントのテキスト (if文の条件文)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processIfStatement(tokenList, startIndex) {
    const statements = [];
    const ifToken    = tokenList[startIndex];

    // if文 開始要素 & 分岐条件を書き出し
    const conditionResult = extractConditionString(tokenList, startIndex + 1);
    statements.push({
        "Type"           : s_TOKEN_MAP[ifToken.TokenType].symbol,
        "Statement"      : conditionResult.conditionText,
        "TokenListIndex" : ifToken.TokenListIndex
    });

    // if文 終了要素を書き出し
    const endBraceIndex   = getEndBraces(tokenList, conditionResult.lastTokenIndex + 1);
    statements.push({
        "Type"           : "End_" + s_TOKEN_MAP[ifToken.TokenType].symbol,
        "Statement"      : null,
        "TokenListIndex" : tokenList[endBraceIndex].TokenListIndex
    });

    return {
        statements : statements,
        nextIndex  : conditionResult.lastTokenIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * else文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          elseのステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - elseのステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "else", "End_else")
 *       - {string} statements.Statement      - ステートメントのテキスト ("(other)"固定)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processElseStatement(tokenList, startIndex) {
    const statements = [];
    const elseToken  = tokenList[startIndex];
    let   nextIndex  = startIndex + 1;
    const nextToken  = tokenList[nextIndex];

    if (nextToken.TokenType === TOKEN_IF) { // else_if文 

        // else_if文 開始要素 & 分岐条件を書き出し
        const conditionResult = extractConditionString(tokenList, nextIndex + 1);
        statements.push({
            "Type"           : "else_if",
            "Statement"      : conditionResult.conditionText,
            "TokenListIndex" : elseToken.TokenListIndex
        });

        nextIndex = conditionResult.lastTokenIndex + 1;

        // else_if文 終了要素を書き出し
        const endBraceIndex = getEndBraces(tokenList, nextIndex);
        statements.push({
            "Type"           : "End_" + "else_if",
            "Statement"      : null,
            "TokenListIndex" : tokenList[endBraceIndex].TokenListIndex
        });

    }
    else { // else文 

        // else_if文 開始要素 & 分岐条件を書き出し
        statements.push({
            "Type"           : s_TOKEN_MAP[elseToken.TokenType].symbol,
            "Statement"      : "(other)",
            "TokenListIndex" : elseToken.TokenListIndex
        });

        // else文 終了要素を書き出し
        const endBraceIndex = getEndBraces(tokenList, nextIndex);
        statements.push({
            "Type"           : "End_" + s_TOKEN_MAP[elseToken.TokenType].symbol,
            "Statement"      : null,
            "TokenListIndex" : tokenList[endBraceIndex].TokenListIndex
        });
    }

    return {
        statements : statements,
        nextIndex  : nextIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * switch文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          switchのステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - switchのステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "switch", "End_switch")
 *       - {string} statements.Statement      - ステートメントのテキスト (switch文の条件文)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processSwitchStatement(tokenList, startIndex) {

    // if文と同一処理のためラッパ関数とする(実処理はif文のプロセス関数を実行)
    const processResult = processIfStatement(tokenList, startIndex)

    return {
        statements : processResult.statements,
        nextIndex  : processResult.nextIndex
    };
}

/*===============================================================================================================================*/
/**
 * case文・default文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          case文・default文のステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - case文・default文のステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "case", "End_case","default", "End_default")
 *       - {string} statements.Statement      - ステートメントのテキスト (case文・default文文の条件文)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processCaseOrDefaultStatement(tokenList, startIndex) {
    const statements = [];
    const caseToken  = tokenList[startIndex];

    let conditionResult = extractCaseConditionString(tokenList, startIndex + 1);
    const endCaseIndex  = getEndCace(tokenList, conditionResult.lastTokenIndex + 1);

    if (caseToken.TokenType == TOKEN_DEFAULT) {
        conditionResult.conditionText = "(other)";
    }

    // case文・default文 開始要素 & 分岐条件を書き出し
    statements.push({
        "Type"           : s_TOKEN_MAP[caseToken.TokenType].symbol,
        "Statement"      : conditionResult.conditionText,
        "TokenListIndex" : caseToken.TokenListIndex
    });
    
    // case文・default文 終了要素 & 分岐条件を書き出し
    statements.push({
        "Type"           : "End_" + s_TOKEN_MAP[caseToken.TokenType].symbol,
        "Statement"      : conditionResult.conditionText,
        "TokenListIndex" : tokenList[endCaseIndex].TokenListIndex
    });

    return {
        statements : statements,
        nextIndex  : conditionResult.lastTokenIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * while文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          whileのステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - whileのステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "while", "End_while")
 *       - {string} statements.Statement      - ステートメントのテキスト (while文の条件文)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processWhileStatement(tokenList, startIndex) {

    // if文と同一処理のためラッパ関数とする(実処理はif文のプロセス関数を実行)
    const processResult = processIfStatement(tokenList, startIndex)

    return {
        statements : processResult.statements,
        nextIndex  : processResult.nextIndex
    };
}

/*===============================================================================================================================*/
/**
 * for文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          forのステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - forのステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "for", "End_for")
 *       - {string} statements.Statement      - ステートメントのテキスト (for文の条件文)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processForStatement(tokenList, startIndex) {

    // if文と同一処理のためラッパ関数とする(実処理はif文のプロセス関数を実行)
    const processResult = processIfStatement(tokenList, startIndex)

    return {
        statements : processResult.statements,
        nextIndex  : processResult.nextIndex
    };
}

/*===============================================================================================================================*/
/**
 * break文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          breakのステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - breakのステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ (例: "break")
 *       - {string} statements.Statement      - ステートメントのテキスト (null)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processBreakStatement(tokenList, startIndex) {
    const statements = [];
    const breakToken    = tokenList[startIndex];

    statements.push({
        "Type"           : s_TOKEN_MAP[breakToken.TokenType].symbol,
        "Statement"      : null,
        "TokenListIndex" : breakToken.TokenListIndex
    });

    return {
        statements : statements,
        nextIndex  : startIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * "{","}"のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          空要素(次の読み込み位置のみ、現在位置から+1)
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - 空要素
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processBrace(tokenList, startIndex) {

    // 何もしない(読み捨て)

    return {
        statements : [],
        nextIndex  : startIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * ";"のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          空要素(次の読み込み位置のみ、現在位置から+1)
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - 空要素
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processSemicolon(tokenList, startIndex) {

    // 何もしない(読み捨て)
 
    return {
        statements : [],
        nextIndex  : startIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * return文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          return文のステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - return文のステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ ("return")
 *       - {string} statements.Statement      - ステートメントのテキスト (戻り値)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processReturnStatement(tokenList, startIndex) {
    const statements      = [];
    const returnToken     = tokenList[startIndex];

    // return文要素を書き出し
    const returnResult = extractReturnValString(tokenList, startIndex + 1);
    statements.push({
        "Type"           : s_TOKEN_MAP[returnToken.TokenType].symbol,
        "Statement"      : returnResult.conditionText,
        "TokenListIndex" : returnToken.TokenListIndex
    });

    return {
        statements : statements,
        nextIndex  : returnResult.lastTokenIndex + 1
    };
}

/*===============================================================================================================================*/
/**
 * 処理文のステートメント要素を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          処理文のステートメント要素リスト
 *     - { statements, nextIndex } 
 *     - {Array<Object>} statements           - 処理文のステートメント要素リスト
 *       - {string} statements.Type           - ステートメントのタイプ ("Statement")
 *       - {string} statements.Statement      - ステートメントのテキスト (処理文)
 *       - {number} statements.TokenListIndex - 元のトークンリスト内のインデックス
 *     - {number} nextIndex                   - トークンリストの次の読み込み位置
 */
/*===============================================================================================================================*/
function processRegularStatement(tokenList, startIndex) {
    let statementStr        = "";
    let statementStartIndex = startIndex;
    let currentIndex        = startIndex;

    // セミコロンまで読み込む
    while (currentIndex < tokenList.length && tokenList[currentIndex].TokenType !== TOKEN_SEMICOLON) {
        statementStr += tokenList[currentIndex].String + " ";
        currentIndex++;
    }

    if (currentIndex < tokenList.length && tokenList[currentIndex].TokenType === TOKEN_SEMICOLON) {
        statementStr += tokenList[currentIndex].String;           // セミコロンを追加
        statementStr = formatStatementString(statementStr);     // 整形処理

        const node = {
            "Type"           : "Statement",
            "Statement"      : statementStr,
            "TokenListIndex" : tokenList[statementStartIndex].TokenListIndex
        };
        return { statements: [node], nextIndex: currentIndex + 1 };
    }
    else {
        // セミコロンが見つからなかった場合（ファイルの終端など）
        statementStr = formatStatementString(statementStr);                  // 整形処理
         const node = {
            "Type"           : "Statement",
            "Statement"      : statementStr + " /* Missing semicolon? */",   // 不完全であることを示す
            "TokenListIndex" : tokenList[statementStartIndex].TokenListIndex

        };
        return { statements: [node], nextIndex: currentIndex }; // 次のインデックスはそのまま
    }
}

/*===============================================================================================================================*/
/**
 * ステートメント要素の文字列を成形するヘルパー関数。
 *
 * @param {string} str          - 成形対象の文字列
 * @returns {string}              成形済の文字列
 */
/*===============================================================================================================================*/
function formatStatementString(str) {
    return str.replace(/\+ =/g,  "+=" )
              .replace(/\- =/g,  "-=" )
              .replace(/\+ \+/g, "++" )
              .replace(/\- \-/g, "--" )
              .replace(/ \. /g,  "."  )
              .replace(/\\n/g,   "￥n") // 全角￥での代用
              .trim();                  // 前後の空白を削除
}

/*===============================================================================================================================*/
/**
 * 条件文を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          条件文
 *     - { conditionText, lastTokenIndex } 
 *     - {string} conditionText               - 読み込んだ条件文
 *     - {number} lastTokenIndex              - 読み進めたトークンの位置   
 */
/*===============================================================================================================================*/
function extractConditionString(tokenList, startIndex) {
    const conditionTokens = [];
    let nestLevel         = 0;
    let lastTokenIndex    = -1; // 見つからなかった場合 -1

    for (let i = startIndex; i < tokenList.length; i++) {
        const token = tokenList[i];
        conditionTokens.push(token.String);
        
        if (token.TokenType === TOKEN_PARENTHESES_OPEN) {
            nestLevel++;
        }
        else if (token.TokenType === TOKEN_PARENTHESES_CLOSE) {
            if (nestLevel === 1) {
                lastTokenIndex = i;
                break;
            }
            else if (nestLevel > 1) {
                nestLevel--;
            }
            else {
                // { のネストが0以下(ありえない状態)の場合はエラー通知 かつ 読み込みを中断する
                console.error("Mismatched parentheses in condition starting near index:", startIndex);
                lastTokenIndex = i;
                break;
            }
        }
    }

    if (lastTokenIndex === -1) {
        // エラー処理: "(条件文)"の構文になっていないため、null要素を返す
        console.error("Could not find closing parenthesis for condition starting near index:", startIndex);
        return {
            conditionText  : null,
            lastTokenIndex : startIndex - 1  // 開始位置の一つ前を返す
        }; 
    }

    // 整形処理
    const conditionText = formatConditionString(conditionTokens.join(" "));

    return { conditionText, lastTokenIndex };
}

/*===============================================================================================================================*/
/**
 * 条件文の文字列を成形するヘルパー関数。
 *
 * @param {string} str          - 成形対象の文字列
 * @returns {string}              成形済の文字列
 */
/*===============================================================================================================================*/
function formatConditionString(str) {
    // 条件式用の整形 (formatStatementString と共通化できる部分もあるかも)
    return str.replace(/\| \|/g, "||")
              .replace(/& &/g,   "&&" )
              .replace(/= =/g,   "==" )
              .replace(/! =/g,   "!=" )
              .replace(/> =/g,   ">=" )
              .replace(/< =/g,   "<=" )
              .replace(/\+ \+/g, "++" )
              .replace(/\- \-/g, "--" )
              .replace(/\\n/g,   "￥n") // 全角￥での代用は維持
              .trim();                  // 前後の空白を削除
}

/*===============================================================================================================================*/
/**
 * 条件文(case文用)のを取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          条件文(case文用)
 *     - { conditionText, lastTokenIndex } 
 *     - {string} conditionText               - 読み込んだ条件文
 *     - {number} lastTokenIndex              - 読み進めたトークンの位置   
 */
/*===============================================================================================================================*/
function extractCaseConditionString(tokenList, startIndex) {
    const conditionTokens = [];
    let lastTokenIndex    = -1; // 見つからなかった場合 -1

    for (let i = startIndex; i < tokenList.length; i++) {
        const token = tokenList[i];
        
        if (token.TokenType === TOKEN_COLON) {   // ":"
            lastTokenIndex = i;
            break;
        }
        else {
            conditionTokens.push(token.String);
        }
    }

    if (lastTokenIndex === -1) {
        // エラー処理: " 条件文 :"の構文になっていないため、null要素を返す
        console.error("Could not find closing colon for condition starting near index:", startIndex);
        return {
            conditionText  : null,
            lastTokenIndex : startIndex - 1  // 開始位置の一つ前を返す
        }; 
    }

    // 整形処理
    const conditionText = formatConditionString(conditionTokens.join(" "));

    return { conditionText, lastTokenIndex };
}

/*===============================================================================================================================*/
/**
 * 戻り値(return文用)のを取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {Object}                          戻り値(return文用)
 *     - { conditionText, lastTokenIndex } 
 *     - {string} conditionText               - 読み込んだ条件文
 *     - {number} lastTokenIndex              - 読み進めたトークンの位置   
 */
/*===============================================================================================================================*/
function extractReturnValString(tokenList, startIndex) {
    const conditionTokens = [];
    let lastTokenIndex    = -1; // 見つからなかった場合 -1

    for (let i = startIndex; i < tokenList.length; i++) {
        const token = tokenList[i];
        conditionTokens.push(token.String);
        
        if (token.TokenType === TOKEN_SEMICOLON) {   // ";"
            lastTokenIndex = i;
            break;
        }
    }

    if (lastTokenIndex === -1) {
        // エラー処理: " 条件文 :"の構文になっていないため、null要素を返す
        console.error("Could not find closing semicolon for condition starting near index:", startIndex);
        return {
            conditionText  : null,
            lastTokenIndex : startIndex - 1  // 開始位置の一つ前を返す
        }; 
    }

    // 整形処理
    const conditionText = formatConditionString(conditionTokens.join(" "));

    return { conditionText, lastTokenIndex };
}

/*===============================================================================================================================*/
/**
 * 処理ブロックの終了位置(}の位置)を取得します。({で開始しない単独処理文の場合;の位置を取得します)
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {number}                          処理ブロックの終了位置   
 */
/*===============================================================================================================================*/
function getEndBraces(tokenList, startIndex) {
    let   nestLevel         = 0;
    let   lastTokenIndex    = -1; // 見つからなかった場合 -1
    const startToken        = tokenList[startIndex];

    if (startToken.TokenType != TOKEN_BRACES_OPEN) {                 // "{ ～ }"省略形(単独処理文)の場合
        for (let i = startIndex; i < tokenList.length; i++) {
            const token = tokenList[i];

            if (token.TokenType == TOKEN_SEMICOLON) {                // ";"
                lastTokenIndex = i;
                break;
            }
        }
    }
    else {
        for (let i = startIndex; i < tokenList.length; i++) {
            const token = tokenList[i];
            
            if (token.TokenType === TOKEN_BRACES_OPEN) {             // "{"
                nestLevel++;
            }
            else if (token.TokenType === TOKEN_BRACES_CLOSE) {       // "}"
                if (nestLevel === 1) {
                    lastTokenIndex = i;
                    break;
                }
                else if (nestLevel > 1) {
                    nestLevel--;
                }
                else {
                    // { のネストが0以下(ありえない状態)の場合はエラー通知 かつ 読み込みを中断する
                    console.error("Mismatched braces in condition starting near index:", startIndex);
                    lastTokenIndex = i;
                    break;
                }
            }
        }
    }

    if (lastTokenIndex === -1) {
        // エラー処理: " {処理文} or 処理文; "の構文になっていないため、null要素を返す
        console.error("Could not find closing braces for condition starting near index:", startIndex);
        return startIndex - 1;  // 開始位置の一つ前を返す
    }

    return lastTokenIndex;
}

/*===============================================================================================================================*/
/**
 * Case文の終了位置を取得します。
 *
 * @param {Array<Object>} tokenLists          - トークンのリスト
 *     - { TokenType, String, TokenListIndex } の配列
 *     - {string} TokenType                   - トークンのタイプ(内容はTokenMap参照)
 *     - {string} String                      - トークンの文字列 
 *     - {number} TokenListIndex              - トークンリストのインデックス
 * @param {number} startIndex                 - トークンリストの読み込み開始位置
 * @returns {number}                          Case文の終了位置   
 */
/*===============================================================================================================================*/
function getEndCace(tokenList, startIndex) {
    let   nestLevel         = 0;
    let   lastTokenIndex    = -1; // 見つからなかった場合 -1

    for (let i = startIndex; i < tokenList.length; i++) {
        const token = tokenList[i];
        
        if (token.TokenType === TOKEN_BRACES_OPEN) {             // switch文開始 { 以外の { "
            nestLevel++;
        }
        else if (token.TokenType === TOKEN_BRACES_CLOSE) {       // "}"
            if (nestLevel === 0) {                               // "switch文終了 } ならbreakがなくとも終了する
                lastTokenIndex = i;
                break;
            }
            else if (nestLevel >= 1) {
                nestLevel--;
            }
            else {
                // { のネストが-1以下(ありえない状態)の場合はエラー通知 かつ 読み込みを中断する
                console.error("Mismatched braces in condition starting near index:", startIndex);
                lastTokenIndex = i;
                break;
            }
        }
        else if (token.TokenType == TOKEN_BREAK) {              // "break"
            if (nestLevel == 0) {                               // case文の直下のbreakなら終了する
                lastTokenIndex = i;
                break;
            }
        }
        else {
            /* 何もしない */
        }
    }

    if (lastTokenIndex === -1) {
        // エラー処理: " {処理文} or 処理文; "の構文になっていないため、null要素を返す
        console.error("Could not find closing break for condition starting near index:", startIndex);
        return startIndex - 1;  // 開始位置の一つ前を返す
    }

    return lastTokenIndex;
}

/*===============================================================================================================================*/
/**
 * ステートメント要素のリストからSwitch文のbreak文削除、及び同一処理のcase文の条件をorで結合します。
 *
 * @param {Array<Object>} statementElements - シーケンス要素のリスト
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                      - ステートメントのタイプ 
 *     - {string} Statement                 - ステートメント(処理文・および分岐制御文の条件文)  
 *     - {number} TokenListIndex            - ステートメント開始位置(トークンリストのインデックス) 
 */
/*===============================================================================================================================*/
function adjustSwitchStatement(statementElements) {
    const adjustElements = [];
    let   switchTargets  = [];
    let   caseCondition  = "";

    for (let i = 0; i < statementElements.length; i++) {
        if ( (0 < i) && (i < (statementElements.length - 1)) ) {
            const curentElement = statementElements[i];
            const nextElement   = statementElements[i + 1];
            const preElement    = statementElements[i - 1];

            if (curentElement.Type === "switch") {
                switchTargets.push( curentElement.Statement
                                    .replace(/\(/g, "")
                                    .replace(/\)/g, "")     );
                adjustElements.push(curentElement);
            }
            else if (curentElement.Type === "End_switch") {
                switchTargets.pop();
                adjustElements.push(curentElement);
            }
            else if ( ( (curentElement.Type === "break" ) && (preElement.Type === "End_case"   ) ) 
                   || ( (curentElement.Type === "break" ) && (preElement.Type === "End_default") ) ) {
                // 不要break文のため削除
            }
            else if ( ( (curentElement.Type === "case"    ) && (nextElement.Type === "case"    ) ) 
                   || ( (curentElement.Type === "End_case") && (nextElement.Type === "End_case") ) ) {
                caseCondition += `( ${switchTargets[switchTargets.length - 1]} == ${curentElement.Statement} ) || `
            }
            else if ( ( (curentElement.Type === "case"    ) && (nextElement.Type !== "case"    ) ) 
                   || ( (curentElement.Type === "End_case") && (nextElement.Type !== "End_case") ) ) {
                caseCondition += `( ${switchTargets[switchTargets.length - 1]} == ${curentElement.Statement} )`
                adjustElements.push({
                    "Type"           : curentElement.Type,
                    "Statement"      : caseCondition,
                    "TokenListIndex" : curentElement.TokenListIndex
                });
                caseCondition  = [];
            }
            else {
                adjustElements.push(curentElement);
            }
        }
        else {
            adjustElements.push(statementElements[i]);
        }
    }

    return adjustElements;
}

/*===============================================================================================================================*/
/**
 * Switch文のFallThrough行を検出し、ステートメント要素のリストに追加します。
 *
 * @param {Array<Object>} statementElements - シーケンス要素のリスト
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                      - ステートメントのタイプ 
 *     - {string} Statement                 - ステートメント(処理文・および分岐制御文の条件文)  
 *     - {number} TokenListIndex            - ステートメント開始位置(トークンリストのインデックス) 
 */
/*===============================================================================================================================*/
function addFallThroughStatement(statementElements) {
    const addedElements    = [];
    let curentCaseElements = [];
    let curentCaseIndex    = [];
    let nextCaseIndex      = [];
    let nestLevel          = 0;

    for (let i = 0; i < statementElements.length; i++) {
        const curentElement = statementElements[i];

        if (curentElement.Type === "switch") {
            nestLevel++;
            curentCaseIndex.push(null);
            nextCaseIndex.push(null);
            curentCaseElements.push(null);
        }
        else if (curentElement.Type === "End_switch") {
            nestLevel--;
            curentCaseIndex.pop();
            nextCaseIndex.pop();
            curentCaseElements.pop();
        }
        else {
            // 何もしない
        }

        // switch文の中
        if (nestLevel > 0) {
            if (curentElement.Type === "case") {
                if (curentCaseIndex[nestLevel - 1] === null) { // 今のcase
                    curentCaseElements[nestLevel - 1] = statementElements[i];
                    curentCaseIndex[nestLevel - 1]   = i;
                    addedElements.push(curentElement);
                }
                else if (nextCaseIndex[nestLevel - 1] === null) { // 次のcase
                    nextCaseIndex[nestLevel - 1] = i;
                }
                else { // 3つ目以降のcase
                    // 何もしない
                }
            }
            else if (curentElement.Type === "End_case") { // 今のcaseの終了
                addedElements.push({
                    "Type"           : curentElement.Type,
                    "Statement"      : curentCaseElements[nestLevel - 1].Statement,
                    "TokenListIndex" : curentElement.TokenListIndex
                });
                if (nextCaseIndex[nestLevel - 1] !== null) { // 今のcaseの終了前に次のcaseが開始していた場合
                    i = nextCaseIndex[nestLevel - 1] - 1;    // 次のcaseに戻って再開
                }
                curentCaseIndex[nestLevel - 1] = null;
                nextCaseIndex[nestLevel - 1]   = null;
            }
            else {
                // FallThrough行はTokenListIndexを次のCaseより一つ前に戻して登録する(Indexソート時の順序を維持するため)
                if ( (nextCaseIndex[nestLevel - 1] !== null) && (i >= nextCaseIndex[nestLevel - 1]) ) {
                    addedElements.push({
                        "Type"           : curentElement.Type,
                        "Statement"      : curentElement.Statement,
                        "TokenListIndex" : statementElements[ nextCaseIndex[nestLevel - 1] ].TokenListIndex - 1
                    });
                }
                else {
                    addedElements.push(curentElement);
                }
            }
        }
        else {
            addedElements.push(curentElement);
        }
    }

    return addedElements;
}

/*===============================================================================================================================*/
/**
 * ステートメント要素のリスト (C言語の制御文・処理文などの要素) をHTMLテーブルに表示します。
 *
 * @param {Array<Object>} statementElements - シーケンス要素のリスト
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                      - ステートメントのタイプ 
 *     - {string} Statement                 - ステートメント(処理文・および分岐制御文の条件文)  
 *     - {number} TokenListIndex            - ステートメント開始位置(元のトークンリスト内のインデックス) 
 * @param {string} tableId                  - 表示先のHTMLテーブル要素のID
 */
/*===============================================================================================================================*/
function displayStatementElementsInTable(statementElements, tableId) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        console.error(`ID "${tableId}" を持つテーブル要素が見つかりません。`);
        return;
    }

    // 以前の内容をクリアし、ヘッダーを設定
    tableElement.innerHTML = `
        <thead>
            <tr>
                <th>Type</th>
                <th>Statement</th>
                <th>TokenListIndex</th>
            </tr>
        </thead>
        <tbody>
        </tbody>`;

    const tableBody = tableElement.querySelector('tbody');

    // テーブル行を生成
    for (const element of statementElements) {
        const row = tableBody.insertRow();

        const cell1 = row.insertCell();
        cell1.textContent = element.Type;

        const cell2 = row.insertCell();
        cell2.textContent = element.Statement;

        const cell3 = row.insertCell();
        cell3.textContent = element.TokenListIndex;
    }
        
}

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2025/03/30 : 北原英樹 : 新規作成                                                                                 */
/*            : 2025/04/23 : 北原英樹 : 実装方法を見直し                                                                         */
/*                                                                                                                               */
/*===============================================================================================================================*/
