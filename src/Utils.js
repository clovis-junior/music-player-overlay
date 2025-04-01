export function AddZero(number = 0) {
  number = number.toString();
  
  return (number.length < 2) ? `0${number.toString()}` : number
}

export function IsEmpty(variable) {
  return (typeof variable === 'undefined' || variable === null || (typeof variable === 'string' && variable.length <= 0))
}

export function GenerateRandomString(length = 8, uppercase = true, numbers = true) {
  let result = '';

  let chars = 'abcdefghijklmnopqrstuvwxyz';

  if(uppercase)
    chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  if(numbers)
    chars += '0123456789';

  let counter = 0;
  while (counter < length) {
    result += chars.charAt(Math.floor(Math.random() * length));
    counter += 1
  }

  return result
}

export function URLValidade(value) {
  let filter=/^(https?):\/\/(?:www\.)?([a-zA-Z0-9-]{1,256})\.([a-zA-Z0-9.]{2,})\b([a-zA-Z0-9-_()@:%+.~#?&//=]*)$/is;
  return (filter.test(value)) ? true : false;
}
  
export function ConvertTime(time = 0) {
  const minutes = Math.floor(time / 60),
    seconds = Math.floor(time % 60);
  
  return `${AddZero(minutes)}:${AddZero(seconds)}`
}
