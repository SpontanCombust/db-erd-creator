export default class DbDataType {
    private _name: string; // name of the data type
    private _params?: string[]; // any parameters that may be passed in parenthesis
    private _postfix?: string; // additional type specifier (like with TIMESTAMP(p) WITH TIME ZONE)

    constructor(
        name: string,
        params?: string[],
        postfix?: string,
    ) {
        this._name = name;
        this._params = params;
        this._postfix = postfix;
    }


    public get name() : string {
        return this._name;
    }

    public get fullName() : string {
        let n = this._name;
        if (this._postfix) {
            n += " " + this._postfix;
        }
        return n;
    }

    public get params() : string[] | undefined {
        return this._params;
    }


    public static parse(s: string) : DbDataType {
        s = s.trim();
        
        const lparenIdx = s.indexOf('(');
        const rparenIdx = s.indexOf(')');
        if (lparenIdx == -1 || rparenIdx == -1) {
            return new DbDataType(s);
        }

        const name = s.substring(0, lparenIdx).trim();
        const paramsText = s.substring(lparenIdx + 1, rparenIdx);
        const params = paramsText.split(',').map(p => p.trim());

        let postfix: string | undefined = s.substring(rparenIdx + 1).trim();
        if (postfix.length == 0) {
            postfix = undefined;
        }

        return new DbDataType(name, params, postfix);
    }

    public replaceParams(args?: string[]) : DbDataType {
        if (args?.length == 0) {
            args = undefined;
        }

        return new DbDataType(
            this._name,
            args,
            this._postfix
        );
    }

    public toString() : string {
        let s = this._name;
        if (this._params) {
            s += '(' + this._params.join(', ') + ')'; 
        }
        if (this._postfix) {
            s += " " + this._postfix;
        }

        return s;
    }
}