import { ObjectId } from "mongodb";

//checks against a value being null
export const checkNull = (input, var_name) => {
    if(input == null){
        throw new Error(var_name + ' is Null');
    }
}

//checks against a value being undefined
export const checkUndef = (input, var_name) => {
    if(input == undefined){
        throw new Error(var_name + ' is undefined');
    }
}

//this is just here to round out the set
export const checkNan = (input, var_name) => {
    if(isNaN(input)){
        throw new Error(var_name + ' is NAN');
    }
}

//checks that the input is a valid string
export const checkString = (input, var_name) => {
    checkNull(input,var_name);
    checkUndef(input,var_name);
    if(!(typeof input === 'string')){
        throw new Error(var_name + ' is not a String');
    }
}

//checks that the input is a valid number
export const checkNum = (input, var_name) => {
    checkNull(input,var_name);
    checkUndef(input,var_name);
    checkNan(input,var_name);
    if(!(typeof input === 'number')){
        throw new Error(var_name + ' is not a Number');
    }
}


// this one actually returns the resulting string, since its already trimming it
export const checkStringTrimmed = (input,var_name) => {
    checkString(input,var_name);
    input = input.trim();
    if(input.length <= 0){
        throw new Error(var_name + ' is an empty String');
    }
    return input;
}

export const checkId = (input, var_name) => {
    checkString(input);
    if(!ObjectId.isValid(input)){
        throw new Error(var_name + ' is not a valid ObjectId');
    }
}