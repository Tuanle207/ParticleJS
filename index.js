(function() {
    const canvas = document.querySelector('#canvas');
    const context = canvas.getContext('2d');
    const particleSize = 6;
    const minDistance = 200;
    const maxLineWidth = 5;
    
    function Point(context, x = 0, y = 0, dx = 0.1, dy = 0.1, w = particleSize, h = particleSize, color = '#fff') {
        this.context = context;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.w = w;
        this.h = h;
        this.color = color;
        this.calcNewPosition = function() {
            this.x += this.dx;
            this.y += this.dy;
        }
        this.calcDistance = function(point) {
            return ((this.x - point.x)**2 + (this.y - point.y)**2)**0.5;;
        }
        this.canBound = function(point) {
            const distance = this.calcDistance(point);
            if (distance == 0 || distance > minDistance) return false;
            return true;
        }
        this.handleCollision = function() {
            if (this.x > canvas.clientWidth - this.w || this.x < 0) this.dx = -this.dx;
            if (this.y > canvas.clientHeight - this.h || this.y < 0) this.dy = -this.dy;
        }
        this.draw = function() {
            // Render rectangle
            this.context.fillStyle = this.color;
            // 1) Create a reactangle
            const rect = new Path2D();
            rect.rect(this.x, this.y, this.w, this.h)
            this.context.fill(rect);
        }
        this.bind = function(points) {
            const bindings = points.map(p => {
                if (this.canBound(p)) {
                    // create path from this point to point p
                    const distance = this.calcDistance(p);
                    this.context.strokeStyle = 'rgba(230, 230, 230, 0.25)';
                    this.context.lineWidth = ((1 - distance / minDistance) * maxLineWidth) || 0.1;
                    // 1) create a binding
                    const binding = new Path2D();
                    binding.moveTo(this.x + this.w/2, this.y + this.h/2);
                    binding.lineTo(p.x + p.w/2, p.y + p.h/2);
                    return binding;
                }
                return null;
            });
            // 2) draw into context
            bindings.forEach(b => {
                if (b != null) this.context.stroke(b);
            });
        }
    }
    
    Point.randomPoint = function(context) {
        const x = Math.floor(Math.random() * (canvas.clientWidth - particleSize) );
        const y = Math.floor(Math.random() * (canvas.clientHeight - particleSize) );
        const dx = Math.random() - 0.5 > 0 ? Math.random() * 0.5 + 0.1 : -(Math.random() * 0.5 + 0.1);
        const dy = Math.random() - 0.5 > 0 ? Math.random() * 0.5 + 0.1 : -(Math.random() * 0.5 + 0.1)
        return new Point(context, x, y, dx, dy);
    }
    
    function init(context) {
        const numberOfPoints = 20;
        const points = [];
        for (let i = 0; i < numberOfPoints; i++) {
    
            const point = Point.randomPoint(context);
            points.push(point);
        } 
        window.requestAnimationFrame(draw.bind(null, context, points));
    }
    
    
    function draw(context, points) {
        // Clear canvas
        context.fillStyle = '#fff';
        context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        // Redraw canvas
        context.fillStyle = '#000';
        context.fill((new Path2D()).rect(0, 0, canvas.clientWidth, canvas.clientHeight));
        
        // Render the points
        points.forEach(point => {
            point.draw();
        });
    
        // Render binding between points
        points.forEach(point => {
            point.bind(points);
        })
    
        // Calculate new x, y
        points.forEach(point => {
            point.calcNewPosition();
        });
        
        // Handle collisions
        points.forEach(point => {
            point.handleCollision();
        });
        
        // Request for next rendering
        window.requestAnimationFrame(draw.bind(null, context, points));
    }
    
    init(context);
})();