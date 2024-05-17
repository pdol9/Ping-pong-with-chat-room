const SPEED = 0.02 // limits the computers ability to keep up with the ever faster getting ball

export default class Paddle
{
	paddleElem: HTMLElement;
	//position!: number;

	constructor (paddleElem: HTMLElement)
	{
		this.paddleElem = paddleElem;
		this.reset();
	}

	get position(): number
	{
		return parseFloat(getComputedStyle(this.paddleElem).getPropertyValue("--position"));
	}

	set position(value: number)
	{
		this.paddleElem.style.setProperty("--position", value.toString());
	}

	/*
	* update computer_paddle position
	*/
	update(delta: number, ball_y: number)
	{
		this.position += SPEED * delta * (ball_y - this.position); // ball_y - this.position: up/down
		//this.position = ball_y; // impossible to win
	}

	/*
	* retrieve the paddle as DOMRect object;
	* DOMRect object contains dimension properties of an element;
	*/
	rect()
	{
		return (this.paddleElem.getBoundingClientRect());
	}

	/*
	* reset paddle position to center;
	* called when ball leaves fiel=win/loss;
	*/
	reset()
	{
		this.position = 50;
	}
}