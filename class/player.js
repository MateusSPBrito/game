class Player extends Entity {
    constructor(container, plataforms) {
        super(350, 0, 50, 50, container, plataforms)
        this.jumpsRemaining = 2;
        this.actions = { left: false, right: false, jump: false }
        this.statusY

        this.loadedGun = { timeLoaded: true, btnAtk: true }

        super.createEntity(container.element)
        this.createListener(container)
        this.setSkin()
    }

    createListener(container) {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {

                case 'ArrowUp':
                    this.jump()
                    break

                case 'ArrowLeft':
                    if (this.actions.left) break
                    this.actions.left = true
                    this.setSkin()
                    break

                case 'ArrowRight':
                    if (this.actions.right) break
                    this.actions.right = true
                    this.setSkin()
                    break

                case ' ':
                    this.shoot(container)
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.actions.left = false
                    this.setSkin()
                    break
                case 'ArrowRight':
                    this.actions.right = false
                    this.setSkin()
                    break
                case ' ':
                    this.loadedGun.btnAtk = true
            }
        });

        this.start()
    }

    setSkin(i = 0, oldAction = null) {

        const { frame, action } = this.getAppearanceFrameAndAction(i)
        if (!(frame && action) || (oldAction && oldAction !== action)) return

        super.setSkin(frame)

        if (action == 'right' || action == 'left') setTimeout(() => { this.setSkin(i == 0 ? 1 : 0, action) }, 200);
    }

    getAppearanceFrameAndAction(i) {
        let frame
        let action

        if (this.statusY !== 'OnGround') {
            action = 'jump'

            if (this.speedY < 0) {
                if (this.actions.left && !this.actions.right) frame = riseLeft
                else if (!this.actions.left && this.actions.right) frame = riseRight
                else frame = rise
            }
            else {
                if (this.actions.left && !this.actions.right) frame = dropLeft
                else if (!this.actions.left && this.actions.right) frame = dropRight
                else frame = drop
            }
        }

        else if (this.actions.left === this.actions.right) {
            action = 'stop'
            frame = stopped
        }
        else {
            action = this.actions.left ? 'left' : 'right'
            frame = this.actions.left ? walkLeft[i] : walkRight[i]
        }
        return { frame, action }
    }

    walk() {
        if (this.actions.left === this.actions.right) return
        let direction = this.actions.left ? 'left' : 'right'
        super.walk(direction, 3)
    }

    jump() {
        if (this.jumpsRemaining > 0) {
            this.speedY += -5
            if (this.speedY < -5) this.speedY = -5
            this.jumpsRemaining--
            this.actions.jump = true
            this.setSkin()
        }
    }

    shoot(container) {
        if (!this.loadedGun.timeLoaded || !this.loadedGun.btnAtk) return
        if (this.actions.left === this.actions.right) return

        this.loadedGun.btnAtk = false
        this.loadedGun.timeLoaded = false
        setTimeout(() => { this.loadedGun.timeLoaded = true }, 500)

        let direction = this.actions.left ? 'left' : 'right'
        let platforms = level.plataforms
        let enemies = level.enemies

        new Bullet(this.x, container.height - this.y - this.height / 2, direction, container, enemies, platforms)
    }

    updateCamera() {
        const windowWidth = window.innerWidth;

        if (windowWidth * 0.9 < this.container.width) {

            if (this.x < windowWidth / 5 || this.container.width - this.x < windowWidth / 5) return

            const leftDistance = (windowWidth / 2) - this.x

            this.container.element.style.left = `${leftDistance}px`
        }
    }

    start() {
        const { collision, status } = super.gravity()

        if (collision === 'bottom' && this.actions.jump) {
            this.actions.jump = false
            this.jumpsRemaining = 2
        }

        if (status && status !== this.statusY) {
            this.statusY = status
            this.setSkin()
        }

        this.walk()
        this.updateCamera()
        requestAnimationFrame(() => this.start())
    }
}