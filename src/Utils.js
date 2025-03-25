export function AddZero(number = 0) {
    number = number.toString();
  
    return (number.length < 2) ? `0${number.toString()}` : number
}
  
export function ConvertTime(time = 0) {
    const minutes = Math.floor(time / 60),
      seconds = (time % 60);
  
    return `${AddZero(minutes)}:${AddZero(seconds)}`
}