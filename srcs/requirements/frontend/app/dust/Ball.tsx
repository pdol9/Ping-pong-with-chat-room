const STAR_VELO = 0.025
const MAKE_FASTER = 0.00001

export default class Ball {
	ballElem: HTMLElement;
	velocity!: number;
	direction!: { x: number, y: number }; // definite assignment assertion '!': informs we will initialize these values not here but before we access this variable; 
	
	constructor(ballElem: HTMLElement) {
		this.ballElem = ballElem;
		this.reset();
	}

	/*
	* get the x-variable defined in .css in .ball
	* these geter functions are being automatically called whenever
	  we access the x or y variable with this.x/this.y or ball.x/ball.y
	*/
	get x(): number {
		return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x")); // retrieve value for x coordinate set in .css
	}

	set x(value) {
		this.ballElem.style.setProperty("--x", value.toString());
	}

	get y(): number {
		return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y")); // retrieve value for x coordinate set in .css
	}

	set y(value) {
		this.ballElem.style.setProperty("--y", value.toString());
	}
	
	/*
	* gives current position of our ball;
	* returns DOMRect object 
	*/
	rect(): DOMRect
	{
		return this.ballElem.getBoundingClientRect()
	}

	/*
	* initializes the values;
	*/
	reset()
	{
		this.x = 50;
		this.y = 50;
		this.direction = { x: 0, y: 0} as { x: number, y: number };
		while (Math.abs(this.direction.x) <= 0.2 || Math.abs(this.direction.x) >= 0.9) // <= 0.2: only up/down movement; >= 0.9 only straight left/right movement; Math.abs() in case we have neg. numbers
		{
			const heading = randNumBetween(0, 2 * Math.PI); // determines direction
			this.direction = { x: Math.cos(heading), y: Math.sin(heading) };// convert x and y to a position
		}
		this.velocity = STAR_VELO;
	}

	/*
	* update ball position on x and y axis and check for collision with paddles
	*/
	update(delta: number, paddleRects: DOMRect[])
	{
		this.x += this.direction.x * this.velocity * delta; // changes the value of x in this class but NOT in the styles.css
		this.y += this.direction.y * this.velocity * delta; // x and y only exist here in the .js code
		
		this.velocity += MAKE_FASTER * delta; // makes ball faster with time
		/*
		* flip direction when ball exceeds top or bottom screen
		*/
		const rect: DOMRect = this.rect();
		if (rect.bottom >= window.innerHeight || rect.top <= 0)
		{
			this.direction.y *= -1;
		}

		/*
		* check for collision
		* some(): checks if any element of the array is colliding
		*/
		if (paddleRects.some(r => isCollision(r, rect))) {
			this.direction.x *= -1;
		}

	}
}

/*
* checks for collision by comparing the coordinates
*/
function isCollision(paddleRect: DOMRect, ballRect: DOMRect): boolean
{
	return (paddleRect.left <= ballRect.right && paddleRect.right >= ballRect.left && paddleRect.top <= ballRect.bottom && paddleRect.bottom >= ballRect.top);
}

function randNumBetween(min: number, max: number): number
{
	return Math.random() * (min - max) + min; // ensures the num is in the min-max range and at least the min
}