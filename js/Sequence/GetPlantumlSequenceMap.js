/* ver.0.0.0 */
/*===============================================================================================================================*/
/* PlantUML シーケンス マップ生成                                                                                                */
/* キーが関数名、値がその関数のPlantUMLシーケンス要素の配列であるマップを作成します。                                            */
/*                                                                                                                               */
/*===============================================================================================================================*/
/*===============================================================================================================================*/
/* 定数宣言                                                                                                                      */
/*                                                                                                                               */
/*===============================================================================================================================*/
/*******************************************/
/* PlantUMLのキーワードリスト              */
/*******************************************/
const PLANTUML_KEYWORDS = {
    START      : '@startuml',
    END        : '@enduml',
    TITLE      : 'title',
    ACTIVATE   : 'activate',
    DEACTIVATE : 'deactivate',
    ALT        : 'alt',
    ELSE       : 'else',
    LOOP       : 'loop',
    END_GROUP  : 'end',
    ARROW      : '->>',
    NOTE       : "'", // コメント用
};

/*******************************************************************/
/* C言語のステートメントタイプからPlantUMLキーワードへのマッピング */
/*******************************************************************/
const BRANCH_TYPE_MAP = {
    "if"          : PLANTUML_KEYWORDS.ALT,
    "else_if"     : PLANTUML_KEYWORDS.ELSE,
    "else"        : PLANTUML_KEYWORDS.ELSE,
    "for"         : PLANTUML_KEYWORDS.LOOP,
    "while"       : PLANTUML_KEYWORDS.LOOP,
    "End_if"      : PLANTUML_KEYWORDS.END_GROUP,
    "End_else_if" : PLANTUML_KEYWORDS.END_GROUP,
    "End_else"    : PLANTUML_KEYWORDS.END_GROUP,
    "End_for"     : PLANTUML_KEYWORDS.END_GROUP,
    "End_while"   : PLANTUML_KEYWORDS.END_GROUP,
    "switch"      : PLANTUML_KEYWORDS.ALT,
    "End_switch"  : PLANTUML_KEYWORDS.END_GROUP,
    "case"        : PLANTUML_KEYWORDS.ELSE,
    "End_case"    : null,
    "default"     : PLANTUML_KEYWORDS.ELSE,
    "End_default" : null,
    // 未対応・無視するタイプ
    "break"       : null,
    "return"      : null
};

/*******************************************************************/
/* 初期フィルタリングで分岐ステートメントと見なされるタイプ        */
/*******************************************************************/
const BRANCH_STATEMENT_TYPES = [
    "if",
    "End_if",
    "else",
    "End_else",
    "else_if",
    "End_else_if",
    "while",
    "End_while",
    "for",
    "End_for",
    
    "switch",
    "End_switch",
    "case",
    "End_case",
    "default",
    "End_default"
];

/*******************************************************************/
/* 条件/ステートメントの追記が必要なPlantUMLキーワード             */
/*******************************************************************/
const PLANTUML_KEYWORDS_WITH_CONDITION = [
    PLANTUML_KEYWORDS.ALT,
    PLANTUML_KEYWORDS.ELSE,
    PLANTUML_KEYWORDS.LOOP
];
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
 * 各関数のPlantUMLシーケンス要素のマップを生成します。
 *
 * @param {Array<Object>} statementList - 全ステートメントのリスト
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                  - ステートメントのタイプ (例: "if", "for", "FuncCall")
 *     - {string} Statement             - ステートメントのテキスト (例: 条件、関数名)
 *     - {number} TokenListIndex        - 元のトークンリスト内のインデックス
 * @param {Array<Object>} funcDecList   - 関数定義のリスト
 *     - { Funcname, TokenList_StartIndex, TokenList_EndIndex } の配列
 *     - {string} Funcname              - 関数名
 *     - {number} TokenList_StartIndex  - トークンリスト内の開始インデックス
 *     - {number} TokenList_EndIndex    - トークンリスト内の終了インデックス
 * @returns {Map<string, Array<Object>>} キーが関数名、値がソートされたPlantUMLシーケンス要素
 *                                       ({ Statement: string, TokenListIndex: number }) の配列であるマップ。
 */
/*===============================================================================================================================*/
function getPlantumlSequenceMap(statementList, funcDecList) {
    const sequenceMap = new Map();

    for (const funcDef of funcDecList) {
        const functionSequence = getPlantumlSequenceForFunc(
            statementList,
            funcDecList,
            funcDef.Funcname
        );
        if (functionSequence) { // シーケンス生成が成功した場合のみ追加
             sequenceMap.set(funcDef.Funcname, functionSequence);
        }
    }

    return sequenceMap;
}

/*===============================================================================================================================*/
/**
 * 特定の関数のソートされたPlantUMLシーケンス要素のリストを生成します。
 *
 * @param {Array<Object>} allStatementList - 全ステートメントのリスト。
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                     - ステートメントのタイプ (例: "if", "for", "FuncCall")
 *     - {string} Statement                - ステートメントのテキスト (例: 条件、関数名)
 *     - {number} TokenListIndex           - 元のトークンリスト内のインデックス
 * @param {Array<Object>} funcDecList      - 関数定義のリスト (対象関数を見つけるために使用)
 *     - { Funcname, TokenList_StartIndex, TokenList_EndIndex } の配列
 *     - {string} Funcname                 - 関数名
 *     - {number} TokenList_StartIndex     - トークンリスト内の開始インデックス
 *     - {number} TokenList_EndIndex       - トークンリスト内の終了インデックス
 * @param {string} targetFuncName          -  シーケンスを生成する対象の関数名。
 * @returns {Array<Object> | null} 関数のソートされたシーケンス要素の配列、または関数が見つからない場合は null
 *     - { Statement, TokenListIndex } の配列
 *     - {string} Statement                - PlantUMLのステートメント行(例: "activate Foo", "alt condition", "Foo ->> Bar", "end")
 *     - {number} TokenListIndex           - ソート用の元のインデックス。
 */
/*===============================================================================================================================*/
function getPlantumlSequenceForFunc(allStatementList, funcDecList, targetFuncName) {
    // 対象関数の定義詳細を検索
    const funcDef = funcDecList.find(dec => dec.Funcname === targetFuncName);

    if (!funcDef) {
        console.warn(`警告: 関数 "${targetFuncName}" の定義が見つかりませんでした。`);
        return null; // 関数が見つからなかったことを示す
    }

    const startIndex = funcDef.TokenList_StartIndex;
    const endIndex = funcDef.TokenList_EndIndex;

    // この関数に属するステートメントをフィルタリング
    const functionStatements = allStatementList.filter(statement =>
        statement.TokenListIndex >= startIndex && statement.TokenListIndex <= endIndex
    );

    // 関数内の分岐 (if, else, for, while, end) に対するPlantUML要素を取得
    const branchElements = getPlantumlBranchElements(functionStatements);

    // この関数によって行われる関数呼び出し (activate, arrows, deactivate) に対するPlantUML要素を取得
    const funcCallElements = getPlantumlFuncCallElements(functionStatements, targetFuncName, startIndex, endIndex);

    // 分岐要素と関数呼び出し要素を結合(スプレッド構文"..."で配列要素を展開)
    const combinedSequence = [...branchElements, ...funcCallElements];

    // すべての要素を元のトークンインデックスでソート
    combinedSequence.sort((a, b) => a.TokenListIndex - b.TokenListIndex);

    return combinedSequence;
}

/*===============================================================================================================================*/
/**
 * 分岐関連のステートメントを抽出し、PlantUML要素に変換します。
 *
 * @param {Array<Object>} functionStatements - 現在の関数に属するステートメント
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                       - ステートメントのタイプ (例: "if", "for", "Statement")
 *     - {string} Statement                  - ステートメントのテキスト (例: 条件、関数名)
 *     - {number} TokenListIndex             - 元のトークンリスト内のインデックス
 * @returns {Array<Object>} PlantUML分岐要素の配列
 *     - { Statement, TokenListIndex } の配列
 *     - {string} Statement                  - PlantUMLのステートメント行(例: "alt condition", "loop condition", "end", "end")
 *     - {number} TokenListIndex             - ソート用の元のインデックス。
 */
/*===============================================================================================================================*/
function getPlantumlBranchElements(functionStatements) {

    // 分岐タイプでフィルタリング
    const rawBranchStatements = functionStatements.filter(statement =>
        BRANCH_STATEMENT_TYPES.includes(statement.Type)
    );

    // "else" or "else_if"継続時の"End_*"削除
    // 直後に 'else' または 'else if' が続く冗長な 'end' ステートメントを除外します。
    // これにより、PlantUML出力が簡略化されます (例: 'alt' と 'else' の間の 'end' を回避)。
    const filteredBranchStatements = rawBranchStatements.filter((value, index, array) => {
        if (index < array.length - 1) {
            const currentType = value.Type;
            const nextType = array[index + 1].Type;

            if ( ( (currentType === "End_if") || (currentType === "End_else_if") )
              && ( (nextType    === "else"  ) || (nextType    === "else_if"    ) ) ) {
                return false; //  'end' ステートメントを除外
            }
        }
        return true; // ステートメントを保持
    });

    // PlantUML形式に変換
    const plantumlBranchElements = [];
    for (const branch of filteredBranchStatements) {
        const plantumlType = BRANCH_TYPE_MAP[branch.Type];

        // マップされていないタイプ (switch, case など) はスキップ
        if (plantumlType === null) {
            continue;
        }

        let plantumlStatement = plantumlType;
        // 条件文を有するタイプ (alt, else, loop) & 条件文ありなら条件文も追加
        if (PLANTUML_KEYWORDS_WITH_CONDITION.includes(plantumlType) && branch.Statement) {
             plantumlStatement += " " + branch.Statement;
        }

        plantumlBranchElements.push({
            "Statement"      : plantumlStatement,
            "TokenListIndex" : branch.TokenListIndex
        });
    }

    return plantumlBranchElements;
}

/*===============================================================================================================================*/
/**
 * 関数のアクティベーション、呼び出し、ディアクティベーションのためのPlantUML要素を生成します。
 *
 * @param {Array<Object>} functionStatements - 現在の関数に属するステートメント
 *     - { Type, Statement, TokenListIndex } の配列
 *     - {string} Type                       - ステートメントのタイプ (例: "if", "for", "Statement")
 *     - {string} Statement                  - ステートメントのテキスト (例: 条件、関数名)
 *     - {number} TokenListIndex             - 元のトークンリスト内のインデックス
 * @param {string} currentFuncName        - 処理中の関数名 (呼び出し元)
 * @param {number} startIndex             - 現在の関数の開始トークンインデックス
 * @param {number} endIndex               - 現在の関数の終了トークンインデックス
 * @returns {Array<Object>} PlantUMLのアクティベーション、呼び出し、ディアクティベーション要素の配列
 *     - { Statement, TokenListIndex } の配列
 *     - {string} Statement               - PlantUMLのステートメント行(例: "activate Foo", "Foo ->> Bar", "deactivate Foo")
 *     - {number} TokenListIndex          - ソート用の元のインデックス
 */
/*===============================================================================================================================*/
function getPlantumlFuncCallElements(functionStatements, currentFuncName, startIndex, endIndex) {
    const sequenceFuncCall = [];
    const FuncCallList = [];

    // アクティベーション
    sequenceFuncCall.push({
        "Statement"      : `${PLANTUML_KEYWORDS.ACTIVATE} ${currentFuncName}`,
        "TokenListIndex" : startIndex // アクティベーションは関数の開始時に発生
    });
    
    // 関数呼び出し
    for (const Element of functionStatements) {
        if (Element.Statement !== null) {
            // "1文字以上の英数字&アンダースコア + スペース + (" を関数コールと判定
            let elementString = Element.Statement.match(/\w+ \(/);  
            
            if (elementString !== null) {
                elementString = elementString[0].replace(" \(", ""); // 関数名のみ抽出
                FuncCallList.push({
                    "Funcname"       : elementString,
                    "TokenListIndex" : Element.TokenListIndex
                });
            }
        }
    }
    for (const funcCall of FuncCallList) {
        sequenceFuncCall.push({
            // 呼び出し元 ->> 呼び出し先
            "Statement"      : `${currentFuncName} ${PLANTUML_KEYWORDS.ARROW} ${funcCall.Funcname}`,
            "TokenListIndex" : funcCall.TokenListIndex
        });
    }

    // ディアクティベーション
    sequenceFuncCall.push({
        "Statement"      : `${PLANTUML_KEYWORDS.DEACTIVATE} ${currentFuncName}`,
        "TokenListIndex" : endIndex // ディアクティベーションは関数の終了時に発生
    });

    return sequenceFuncCall;
}

/*===============================================================================================================================*/
/**
 * シーケンス要素のリスト (分岐や呼び出し要素など) をHTMLテーブルに表示します。
 *
 * @param {Array<Object>} sequenceElements - シーケンス要素(PlantUML)のリスト
 *     - { Statement, TokenListIndex } の配列
 *     - {string} Statement                - PlantUMLのステートメント行
 *     - {number} TokenListIndex           - ステートメント開始位置(トークンリストのインデックス) 
 * @param {string} tableId                 - 表示先のHTMLテーブル要素のID
 */
/*===============================================================================================================================*/
function displaySequenceElementsInTable(sequenceElements, tableId) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
        console.error(`ID "${tableId}" を持つテーブル要素が見つかりません。`);
        return;
    }

    // 以前の内容をクリアし、ヘッダーを設定
    tableElement.innerHTML = `
        <thead>
            <tr>
                <th>Statement</th>
                <th>TokenListIndex</th>
            </tr>
        </thead>
        <tbody>
        </tbody>`;

    const tableBody = tableElement.querySelector('tbody');

    // テーブル行を生成
    for (const element of sequenceElements) {
        const row = tableBody.insertRow();

        const cell1 = row.insertCell();
        cell1.textContent = element.Statement;

        const cell2 = row.insertCell();
        cell2.textContent = element.TokenListIndex;
    }
        
}

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2025/04/14 : 北原英樹 : 新規作成                                                                                 */
/*            : 2025/04/17 : 北原英樹 : 実装方法の見直し                                                                         */
/*                                                                                                                               */
/*===============================================================================================================================*/
