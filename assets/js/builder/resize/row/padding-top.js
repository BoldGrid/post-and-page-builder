import { Handle } from '../handle';

export class PaddingTop extends Handle {
	constructor() {
		super();
		this.position = 'top';
		this.tooltip = 'Drag Resize Row';
		this.cssProperty = 'padding-top';
	}
}
