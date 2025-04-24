/* ver.0.0.0 */
/*===============================================================================================================================*/
/* トークンマップ                                                                                                                */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/
const TOKEN_PERIOD                   = 0;
const TOKEN_COMMA                    = 1;
const TOKEN_SEMICOLON                = 2;
const TOKEN_DOUBLE_QUOTATION         = 3;
const TOKEN_HASH                     = 4;
const TOKEN_BACKSLASH                = 5;
const TOKEN_CHAR                     = 6;
const TOKEN_INT                      = 7;
const TOKEN_VOID                     = 8;
const TOKEN_FLOAT                    = 9;

const TOKEN_DOUBLE                   = 10;
const TOKEN_SHORT                    = 11;
const TOKEN_LONG                     = 12;
const TOKEN_VOLATILE                 = 13;
const TOKEN_EXTERN                   = 14;
const TOKEN_ADDITION                 = 15;
const TOKEN_SUBTRACTION              = 16;
const TOKEN_MULTIPLICATION           = 17;
const TOKEN_DIVISION                 = 18;
const TOKEN_MODULO                   = 19;

const TOKEN_ASSIGNMENT               = 20;
const TOKEN_GREATER_THAN             = 21;
const TOKEN_GREATER_THAN_OR_EQUAL_TO = 22;
const TOKEN_LESS_THAN                = 23;
const TOKEN_LESS_THAN_OR_EQUAL_TO    = 24;
const TOKEN_EQUAL                    = 25;
const TOKEN_NOT_EQUAL                = 26;
const TOKEN_LOGICAL_AND              = 27;
const TOKEN_LOGICAL_OR               = 28;
const TOKEN_R_SHIFT                  = 29;

const TOKEN_L_SHIFT                  = 30;
const TOKEN_BITWISE_AND              = 31;
const TOKEN_BITWISE_OR               = 32;
const TOKEN_BITWISE_XOR              = 33;
const TOKEN_BITWISE_NOT              = 34;
const TOKEN_COLON                    = 35;
const TOKEN_QUESTION                 = 36;
const TOKEN_ALIGNOF                  = 37;
const TOKEN_BOOL                     = 38;
const TOKEN_BREAK                    = 39;

const TOKEN_CASE                     = 40;
const TOKEN_CONTINUE                 = 41;
const TOKEN_DO                       = 42;
const TOKEN_ELSE                     = 43;
const TOKEN_FOR                      = 44;
const TOKEN_IF                       = 45;
const TOKEN_RETURN                   = 46;
const TOKEN_SIZEOF                   = 47;
const TOKEN_STRUCT                   = 48;
const TOKEN_SWITCH                   = 49;
const TOKEN_TYPEDEF                  = 50;

const TOKEN_TYPEOF                   = 51;
const TOKEN_WHILE                    = 52;
const TOKEN_DEFAULT                  = 53;
const TOKEN_PARENTHESES_OPEN         = 54;
const TOKEN_PARENTHESES_CLOSE        = 55;
const TOKEN_SQUARE_BRACKETS_OPEN     = 56;
const TOKEN_SQUARE_BRACKETS_CLOSE    = 57;
const TOKEN_BRACES_OPEN              = 58;
const TOKEN_BRACES_CLOSE             = 59;

const TOKEN_IDENTIFIRE               = 60;

const s_TOKEN_MAP = [
    // 比較文字列          , トークンタイプ                          , トークン名
    
    // 記号
    {"symbol" : "."        , "type" : TOKEN_PERIOD                   , "type_name" : "TOKEN_PERIOD"                   },
    {"symbol" : ","        , "type" : TOKEN_COMMA                    , "type_name" : "TOKEN_COMMA"                    },
    {"symbol" : ";"        , "type" : TOKEN_SEMICOLON                , "type_name" : "TOKEN_SEMICOLON"                },
    {"symbol" : '"'        , "type" : TOKEN_DOUBLE_QUOTATION         , "type_name" : "TOKEN_DOUBLE_QUOTATION"         },
    {"symbol" : "#"        , "type" : TOKEN_HASH                     , "type_name" : "TOKEN_HASH"                     },
    {"symbol" : "\\"       , "type" : TOKEN_BACKSLASH                , "type_name" : "TOKEN_BACKSLASH"                },

    // 型
    {"symbol" : "char"     , "type" : TOKEN_CHAR                     , "type_name" : "TOKEN_CHAR"                     },
    {"symbol" : "int"      , "type" : TOKEN_INT                      , "type_name" : "TOKEN_INT"                      },
    {"symbol" : "void"     , "type" : TOKEN_VOID                     , "type_name" : "TOKEN_VOID"                     },
    {"symbol" : "float"    , "type" : TOKEN_FLOAT                    , "type_name" : "TOKEN_FLOAT"                    },
    {"symbol" : "double"   , "type" : TOKEN_DOUBLE                   , "type_name" : "TOKEN_DOUBLE"                   },

    // 修飾子
    {"symbol" : "short"    , "type" : TOKEN_SHORT                    , "type_name" : "TOKEN_SHORT"                    },
    {"symbol" : "long"     , "type" : TOKEN_LONG                     , "type_name" : "TOKEN_LONG"                     },
    {"symbol" : "volatile" , "type" : TOKEN_VOLATILE                 , "type_name" : "TOKEN_VOLATILE"                 },
    {"symbol" : "extern"   , "type" : TOKEN_EXTERN                   , "type_name" : "TOKEN_EXTERN"                   },

    // 演算子
    {"symbol" : "+"        , "type" : TOKEN_ADDITION                 , "type_name" : "TOKEN_ADDITION"                 },
    {"symbol" : "-"        , "type" : TOKEN_SUBTRACTION              , "type_name" : "TOKEN_SUBTRACTION"              },
    {"symbol" : "*"        , "type" : TOKEN_MULTIPLICATION           , "type_name" : "TOKEN_MULTIPLICATION"           },
    {"symbol" : "/"        , "type" : TOKEN_DIVISION                 , "type_name" : "TOKEN_DIVISION"                 },
    {"symbol" : "%"        , "type" : TOKEN_MODULO                   , "type_name" : "TOKEN_MODULO"                   },

    // 代入演算子
    {"symbol" : "="        , "type" : TOKEN_ASSIGNMENT               , "type_name" : "TOKEN_ASSIGNMENT"               },

    // 比較演算子
    {"symbol" : ">"        , "type" : TOKEN_GREATER_THAN             , "type_name" : "TOKEN_GREATER_THAN"             },
    {"symbol" : ">="       , "type" : TOKEN_GREATER_THAN_OR_EQUAL_TO , "type_name" : "TOKEN_GREATER_THAN_OR_EQUAL_TO" },
    {"symbol" : "<"        , "type" : TOKEN_LESS_THAN                , "type_name" : "TOKEN_LESS_THAN"                },
    {"symbol" : "<="       , "type" : TOKEN_LESS_THAN_OR_EQUAL_TO    , "type_name" : "TOKEN_LESS_THAN_OR_EQUAL_TO"    },
    {"symbol" : "=="       , "type" : TOKEN_EQUAL                    , "type_name" : "TOKEN_EQUA"                     },
    {"symbol" : "!="       , "type" : TOKEN_NOT_EQUAL                , "type_name" : "TOKEN_NOT_EQUAL"                },

    // 論理演算子
    {"symbol" : "&&"       , "type" : TOKEN_LOGICAL_AND              , "type_name" : "TOKEN_LOGICAL_AND"              },
    {"symbol" : "||"       , "type" : TOKEN_LOGICAL_OR               , "type_name" : "TOKEN_LOGICAL_OR"               },

    // シフト演算子
    {"symbol" : ">>"       , "type" : TOKEN_R_SHIFT                  , "type_name" : "TOKEN_R_SHIFT"                  },
    {"symbol" : "<<"       , "type" : TOKEN_L_SHIFT                  , "type_name" : "TOKEN_L_SHIFT"                  },

    // ビット演算子
    {"symbol" : "&"        , "type" : TOKEN_BITWISE_AND              , "type_name" : "TOKEN_BITWISE_AND"              },
    {"symbol" : "|"        , "type" : TOKEN_BITWISE_OR               , "type_name" : "TOKEN_BITWISE_OR"               },
    {"symbol" : "^"        , "type" : TOKEN_BITWISE_XOR              , "type_name" : "TOKEN_BITWISE_XOR"              },
    {"symbol" : "~"        , "type" : TOKEN_BITWISE_NOT              , "type_name" : "TOKEN_BITWISE_NOT"              },

    // 3項演算子
    {"symbol" : ":"        , "type" : TOKEN_COLON                    , "type_name" : "TOKEN_COLON"                    },
    {"symbol" : "?"        , "type" : TOKEN_QUESTION                 , "type_name" : "TOKEN_QUESTION"                 },

    // キーワード
    {"symbol" : "_Alignof" , "type" : TOKEN_ALIGNOF                  , "type_name" : "TOKEN_ALIGNOF"                  },
    {"symbol" : "_Bool"    , "type" : TOKEN_BOOL                     , "type_name" : "TOKEN_BOOL"                     },
    {"symbol" : "break"    , "type" : TOKEN_BREAK                    , "type_name" : "TOKEN_BREAK"                    },
    {"symbol" : "case"     , "type" : TOKEN_CASE                     , "type_name" : "TOKEN_CASE"                     },
    {"symbol" : "continue" , "type" : TOKEN_CONTINUE                 , "type_name" : "TOKEN_CONTINUE"                 },
    {"symbol" : "do"       , "type" : TOKEN_DO                       , "type_name" : "TOKEN_DO"                       },
    {"symbol" : "else"     , "type" : TOKEN_ELSE                     , "type_name" : "TOKEN_ELSE"                     },
    {"symbol" : "for"      , "type" : TOKEN_FOR                      , "type_name" : "TOKEN_FOR"                      },
    {"symbol" : "if"       , "type" : TOKEN_IF                       , "type_name" : "TOKEN_IF"                       },
    {"symbol" : "return"   , "type" : TOKEN_RETURN                   , "type_name" : "TOKEN_RETURN"                   },
    {"symbol" : "sizeof"   , "type" : TOKEN_SIZEOF                   , "type_name" : "TOKEN_SIZEOF"                   },
    {"symbol" : "struct"   , "type" : TOKEN_STRUCT                   , "type_name" : "TOKEN_STRUCT"                   },
    {"symbol" : "switch"   , "type" : TOKEN_SWITCH                   , "type_name" : "TOKEN_SWITCH"                   },
    {"symbol" : "typedef"  , "type" : TOKEN_TYPEDEF                  , "type_name" : "TOKEN_TYPEDEF"                  },
    {"symbol" : "typeof"   , "type" : TOKEN_TYPEOF                   , "type_name" : "TOKEN_TYPEOF"                   },
    {"symbol" : "while"    , "type" : TOKEN_WHILE                    , "type_name" : "TOKEN_WHILE"                    },
    {"symbol" : "default"  , "type" : TOKEN_DEFAULT                  , "type_name" : "TOKEN_DEFAULT"                  },

    // 小括弧
    {"symbol" : "("        , "type" : TOKEN_PARENTHESES_OPEN         , "type_name" : "TOKEN_PARENTHESES_OPEN"         },
    {"symbol" : ")"        , "type" : TOKEN_PARENTHESES_CLOSE        , "type_name" : "TOKEN_PARENTHESES_CLOSE"        },

    // 中括弧
    {"symbol" : "["        , "type" : TOKEN_SQUARE_BRACKETS_OPEN     , "type_name" : "TOKEN_SQUARE_BRACKETS_OPEN"     },
    {"symbol" : "]"        , "type" : TOKEN_SQUARE_BRACKETS_CLOSE    , "type_name" : "TOKEN_SQUARE_BRACKETS_CLOSE"    },

    // 大括弧
    {"symbol" : "{"        , "type" : TOKEN_BRACES_OPEN              , "type_name" : "TOKEN_BRACES_OPEN"              },
    {"symbol" : "}"        , "type" : TOKEN_BRACES_CLOSE             , "type_name" : "TOKEN_BRACES_CLOSE"             },

    // 未定義(識別子扱い)：シンボル要素は利用しないため空登録
    {"symbol" : ""         , "type" : TOKEN_IDENTIFIRE               , "type_name" : "TOKEN_IDENTIFIRE"               }
];

/*===============================================================================================================================*/
/* 変更履歴                                                                                                                      */
/*===============================================================================================================================*/
/* バージョン : 日付       : 変更者   : 変更内容                                                                                 */
/* ----------------------------------------------------------------------------------------------------------------------------- */
/* 0.0.0      : 2025/03/15 : 北原英樹 : 新規作成                                                                                 */
/*                                                                                                                               */
/*                                                                                                                               */
/*===============================================================================================================================*/
