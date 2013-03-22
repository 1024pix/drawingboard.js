DrawingBoard.Control.Navigation = function(drawingBoard, opts) {
	this.board = drawingBoard || null;

	this.opts = $.extend({
		backButton: true,
		forwardButton: true,
		resetButton: true
	}, opts);

	this.history = {
		values: [],
		position: 0
	};
	this.saveHistory();

	var el = '<div class="drawing-board-control drawing-board-control-navigation">';
	if (this.opts.backButton) el += '<button class="drawing-board-control-navigation-back">&larr;</button>';
	if (this.opts.forwardButton) el += '<button class="drawing-board-control-navigation-forward">&rarr;</button>';
	if (this.opts.resetButton) el += '<button class="drawing-board-control-navigation-reset">×</button>';
	el += '</div>';
	this.$el = $(el);

	if (this.opts.backButton) {
		this.$el.on('click', '.drawing-board-control-navigation-back', $.proxy(function(e) {
			this.goBackInHistory();
			e.preventDefault();
		}, this));
	}

	if (this.opts.forwardButton) {
		this.$el.on('click', '.drawing-board-control-navigation-forward', $.proxy(function(e) {
			this.goForthInHistory();
			e.preventDefault();
		}, this));
	}

	if (this.opts.resetButton) {
		this.$el.on('click', '.drawing-board-control-navigation-reset', $.proxy(function(e) {
			this.board.reset();
			e.preventDefault();
		}, this));
	}

	this.board.ev.bind('board:stopDrawing', $.proxy(function(e) { this.saveHistory(); }, this));
	this.board.ev.bind('board:reset', $.proxy(function(opts) { this.onBoardReset(opts); }, this));
};

DrawingBoard.Control.Navigation.prototype = {
	saveHistory: function () {
		while (this.history.values.length > 30) {
			this.history.values.shift();
		}
		if (this.history.position !== 0 && this.history.position !== this.history.values.length) {
			this.history.values = this.history.values.slice(0, this.history.position);
			this.history.position++;
		} else {
			this.history.position = this.history.values.length+1;
		}
		this.history.values.push(this.board.getImg());
	},

	_goThroughHistory: function(goForth) {
		if ((goForth && this.history.position == this.history.values.length) ||
			(!goForth && this.history.position == 1))
			return;
		var pos = goForth ? this.history.position+1 : this.history.position-1;
		if (this.history.values.length && this.history.values[pos-1] !== undefined) {
			this.history.position = pos;
			this.board.restoreImg(this.history.values[this.history.position-1]);
		}
		this.board.saveLocalStorage();
	},

	goBackInHistory: function() {
		this._goThroughHistory(false);
	},

	goForthInHistory: function() {
		this._goThroughHistory(true);
	},

	onBoardReset: function(opts) {
		if (opts.history)
			this.saveHistory();
	}
};