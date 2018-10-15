import { Handle } from '../handle';

export class PaddingBottom extends Handle {
	constructor() {
		super();
		this.position = 'bottom';
		this.tooltip = 'Drag Resize Row';
		this.cssProperty = 'padding-bottom';
	}
}
