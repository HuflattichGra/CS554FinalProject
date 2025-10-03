declare module './typechecker.js' {
  export function checkNull(input: any, var_name: string): void;
  export function checkUndef(input: any, var_name: string): void;
  export function checkNan(input: any, var_name: string): void;
  export function checkId(input: any, var_name?: string): string;
  export function checkString(input: any, var_name: string): string;
  export function checkEmail(input: any, var_name: string): string;
  export function checkPassword(input: any, var_name: string): string;
  export function checkNum(input: any, var_name: string): number;
  export function checkBool(input: any, var_name: string): boolean;
  export function checkStrArr(input: any, var_name: string): string[];
  export function checkNumArr(input: any, var_name: string): number[];
  export function checkStringArray(input: any, var_name: string): string[];
}