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
            // 1) Create a object
            const object = new Path2D();
            object.arc(this.x + this.w/2, this.y + this.h / 2, this.w / 2, 0, Math.PI * 2, true);
            // 2) Fill it into canvas context
            this.context.fill(object);
        }
        this.bind = function(points) {
            points.forEach(p => {
                if (this.canBound(p)) {
                    // create path from this point to point p
                    const distance = this.calcDistance(p);
                    const lineWidth = (1 - distance / minDistance) * maxLineWidth;
                    const alpha = (1 - distance / minDistance) * 0.3;
                    this.context.lineWidth = lineWidth < 0.4 ? 0.4 : lineWidth;
                    this.context.strokeStyle = `rgba(230, 230, 230, ${alpha < 0.1 ? 0.1 : alpha})`;
                    // 1) create a binding
                    const binding = new Path2D();
                    binding.moveTo(this.x + this.w/2, this.y + this.h/2);
                    binding.lineTo(p.x + p.w/2, p.y + p.h/2);
                    this.context.stroke(binding);
                }
            });
        }
    }

    
    
    function generatePoint(fastRate = 0.6) {
        let fast = 0;
        return function(context, numberOfInstances) {
            let x = Math.floor(Math.random() * (canvas.clientWidth - particleSize) );
            let y = Math.floor(Math.random() * (canvas.clientHeight - particleSize) );
            let dx = Math.random() - 0.5 > 0 ? Math.random() * 0.5 + 0.1 : -(Math.random() * 0.5 + 0.1);
            let dy = Math.random() - 0.5 > 0 ? Math.random() * 0.5 + 0.1 : -(Math.random() * 0.5 + 0.1);
            if (fast < fastRate * numberOfInstances && (Math.abs(dx) < 0.5 || Math.abs(dx) < 0.5)) {
                Math.random() - 0.5 > 0 
                ? dx = Math.sign(dx) * Math.random() * 0.2 + 2 
                : dy = Math.sign(dx) * Math.random() * 0.2 + 2;
                fast++;
            }
            return new Point(context, x, y, dx, dy);
        }
    }

    Point.randomPoint = generatePoint();
    
    function init(context) {
        const numberOfPoints = 20;
        const points = [];
        for (let i = 0; i < numberOfPoints; i++) {
    
            const point = Point.randomPoint(context, numberOfPoints);
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