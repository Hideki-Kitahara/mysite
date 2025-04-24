/* ver.0.0.0 */
/*===============================================================================================================================*/
/* シーケンス図(PlantUMLテキスト)の取得                                                                                          */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/
/*===============================================================================================================================*/
/* 定数宣言                                                                                                                      */
/*                                                                                                                               */
/*===============================================================================================================================*/
const CALL_STACK_MAX_DEPTH = 255;      // 最大再帰深度
const INDENT_UNIT          = "    ";   // インデントの単位 (スペース4つ)

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
 * 指定された関数から始まるシーケンス図のPlantUMLテキストを生成します。
 *
 * @param {Array<Object>} funcDecList   - 関数定義のリスト
 *     - {string} Funcname              - 関数名
 *     - {number} TokenList_StartIndex  - 関数定義の開始位置(トークンリスト上での位置)
 *     - {number} TokenList_EndIndex    - 関数定義の終了位置(トークンリスト上での位置)
 * @param {Array<Object>} statementList - ステートメントのリスト
 *     - {string} Statement             - ステートメント(PlantUMLテキスト)
 *     - {number} TokenListIndex        - トークンリスト上での位置
 * @param {string} startFuncName        - シーケンス図を開始する関数名
 * @returns {string}                    PlantUML形式のシーケンス図テキスト
 */
/*===============================================================================================================================*/
function generateSequenceDiagram(funcDecList, statementList, startFuncName) {
    const sequenceMap     = getPlantumlSequenceMap(statementList, funcDecList);
    const sequenceLines   = [];
    const processingFuncs = new Set(); // 現在処理中の関数のセット（再帰検出用）

    // ヘッダー追加 (インデントなし)
    sequenceLines.push(PLANTUML_KEYWORDS.START);
    sequenceLines.push(`${PLANTUML_KEYWORDS.TITLE} ${startFuncName}:シーケンス図`);
    sequenceLines.push(''); // 空行

    // 再帰的にシーケンスを生成 (初期深度 0)
    generateSequenceRecursive(startFuncName, sequenceMap, sequenceLines, processingFuncs, 0);

    // フッター追加 (インデントなし)
    sequenceLines.push(''); // 空行
    sequenceLines.push(PLANTUML_KEYWORDS.END);

    return sequenceLines.join('\n');
}

/*===============================================================================================================================*/
/**
 * シーケンス図の要素を再帰的に生成するヘルパー関数
 * 
 * @param {string} currentFuncName                 - 現在処理中の関数名
 * @param {Map<string, Array<Object>>} sequenceMap - キーが関数名、値がソートされたPlantUMLシーケンス要素
 *                                                   ({ Statement: string, TokenListIndex: number }) の配列であるマップ。
 * @param {Array<string>} sequenceLines            - 生成中のPlantUML行を格納する配列
 * @param {Set<string>} processingFuncs            - 現在処理中の関数のセット（再帰検出用）
 * @param {number} depth                           - 現在の再帰深度
 */
/*===============================================================================================================================*/
function generateSequenceRecursive(currentFuncName, sequenceMap, sequenceLines, processingFuncs, depth) {
    // 再帰深度チェック
    if (depth > CALL_STACK_MAX_DEPTH) {
        const indent = INDENT_UNIT.repeat(depth); // インデント生成
        sequenceLines.push(indent + `${PLANTUML_KEYWORDS.NOTE} 最大呼び出し深度 ${CALL_STACK_MAX_DEPTH} を超えたため、${currentFuncName} の詳細なシーケンスを省略します。`);
        console.warn(`Warning: Maximum call stack depth (${CALL_STACK_MAX_DEPTH}) exceeded for function ${currentFuncName}.`);
        return;
    }

    const sequenceList = sequenceMap.get(currentFuncName);

    // 関数がマップに存在しない場合
    if (!sequenceList) {
         console.warn(`Warning: Sequence list not found for function ${currentFuncName}. It might be an external or undefined function.`);
         const indent = INDENT_UNIT.repeat(depth);
         sequenceLines.push(indent + `${PLANTUML_KEYWORDS.ACTIVATE} ${currentFuncName}`);
         sequenceLines.push(indent + `${PLANTUML_KEYWORDS.NOTE} ${currentFuncName} の定義は見つかりませんでした。`);
         sequenceLines.push(indent + `${PLANTUML_KEYWORDS.DEACTIVATE} ${currentFuncName}`);
         return;
    }

    processingFuncs.add(currentFuncName); // 処理開始をマーク

    for (const item of sequenceList) {
        const indent = INDENT_UNIT.repeat(depth); // 現在の深度に応じたインデント文字列を生成

        // PlantUMLの行にインデントを追加して格納
        sequenceLines.push(indent + item.Statement);

        // 関数呼び出しを検出
        if (item.Statement.includes(PLANTUML_KEYWORDS.ARROW)) {
            const parts = item.Statement.split(PLANTUML_KEYWORDS.ARROW);
            const calleeFuncName = parts[1].trim(); // 呼び出し先関数名

            // 再帰呼び出しチェック
            if (processingFuncs.has(calleeFuncName)) {
                sequenceLines.push(indent + `${PLANTUML_KEYWORDS.NOTE} ${calleeFuncName} は再帰的に呼び出されています。`);
                sequenceLines.push(indent + `${PLANTUML_KEYWORDS.ACTIVATE} ${calleeFuncName}`);
                sequenceLines.push(indent + `${PLANTUML_KEYWORDS.DEACTIVATE} ${calleeFuncName}`);
                continue; // 再帰呼び出しの場合は深く追わない
            }

            const calleeSequenceList = sequenceMap.get(calleeFuncName);

            if (calleeSequenceList) {
                // 定義済みの関数なら再帰呼び出し (depth + 1 でインデントを深くする)
                generateSequenceRecursive(calleeFuncName, sequenceMap, sequenceLines, processingFuncs, depth + 1);
            }
            else {
                // 定義されていない関数（外部参照関数など）の呼び出し
                sequenceLines.push(indent + `${PLANTUML_KEYWORDS.ACTIVATE} ${calleeFuncName}`);
                sequenceLines.push(indent + `${PLANTUML_KEYWORDS.NOTE} ${calleeFuncName} の定義は見つかりませんでした。`);
                sequenceLines.push(indent + `${PLANTUML_KEYWORDS.DEACTIVATE} ${calleeFuncName}`);
            }
        }
    }

    processingFuncs.delete(currentFuncName); // 処理完了をマーク
}

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2025/02/13 : 北原英樹 : 新規作成                                                                                 */
/*            : 2025/04/07 : 北原英樹 : 分岐処理(if/else/for/while)をシーケンスに反映                                            */
/*            : 2025/04/15 : 北原英樹 : PlantUMLコードの生成方法を関数単位に変更                                                 */
/*            : 2025/04/15 : 北原英樹 : 関数コール時のスタック管理を廃止し、再帰呼び出しに変更                                   */
/*                                                                                                                               */
/*===============================================================================================================================*/
