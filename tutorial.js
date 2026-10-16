/* Next task. let us improve upon what you just did and incorporate HTML and CSS : 
Use HTML, CSS, and JavaScript to retrieve two numbers from paragraph elements and 
calculate their sum, difference, product, quotient, and remainder. */

function calculate(num1, num2) {
  return {
  sum: num1 + num2,
  difference: num1 - num2,
  product: num1 * num2,
  quotient: num1 / num2,
  remainder: num1 % num2,
  };
}

const num1 = Number(document.getElementById("demo1").textContent);
const num2 = Number(document.getElementById("demo2").textContent);

const results = calculate(num1, num2);

document.getElementById("sum").textContent = "The sum is " + results.sum;
document.getElementById("difference").textContent = "The difference is " + results.difference;
document.getElementById("product").textContent = "The product is " + results.product;
document.getElementById("quotient").textContent = "The quotient is " + results.quotient;
document.getElementById("remainder").textContent = "the remainder is " + results.remainder;