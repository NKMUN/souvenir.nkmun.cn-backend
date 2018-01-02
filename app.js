const Koa = require('koa');

const bodyParser = require('koa-bodyparser');
// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();

var cors = require('koa-cors');

const app = new Koa();

app.use(cors());

const Sequelize = require('sequelize');
const config = require('./config');

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

var User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true
    },
    username: Sequelize.STRING(255),
    password: Sequelize.STRING(255),
    role: Sequelize.STRING(255)
}, {
        timestamps: false
    });

var Souvenir = sequelize.define('souvenir', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true
    },
    name: Sequelize.STRING(255),
    price: Sequelize.INTEGER(11),
    stock: Sequelize.INTEGER(11),
    available: Sequelize.INTEGER(11)

}, {
        timestamps: false
    });

var Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true
    },
    order_info: Sequelize.STRING(4000),
    order_total: Sequelize.STRING(255),
    customer_name: Sequelize.STRING(255),
    customer_committee: Sequelize.STRING(255),
    customer_phone: Sequelize.STRING(255),
    customer_hotel: Sequelize.STRING(255),
    order_time: Sequelize.STRING(255),
    operator: Sequelize.STRING(255),
    confirmed: Sequelize.BOOLEAN,
    note: Sequelize.STRING(2000)
}, {
        timestamps: false
    });

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

// add url-route:
router.post('/user/login', async (ctx, next) => {
    var
        username = ctx.request.body.username;
        password = ctx.request.body.password;
    if (username && password) {
        var users = await User.findAll({
            where: {
                username: username,
                password: password
            }
        });
        if (users.length != 0) {
            for (let u of users) {
                ctx.response.body = JSON.stringify(users);
                ctx.response.type = 'application/json';
                ctx.response.body = {
                    code: '200',
                    message: '登录成功',
                    role: u.role,
                    username: u.username
                };
            }
        } else {
            ctx.response.type = 'application/json';
            ctx.response.body = {
                code: '2003',
                message: '用户名或密码错误'
            };
        }
    } else {
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: '2004',
            message: '请输入正确的用户名或密码'
        };
    }
});

router.get('/souvenir/list', async (ctx, next) => {
    var souvenirs = await Souvenir.findAll();
    if (souvenirs.length != 0) {
        ctx.response.type = 'application/json';
        ctx.response.body = JSON.stringify(souvenirs);
    } else {
        ctx.response.body = {
            code: '2000',
            message: '纪念品记录不存在'
        };
    }
});

router.get('/souvenir/detail/:id', async (ctx, next) => {
    var id = ctx.params.id;
    var souvenirs = await Souvenir.findAll({
        where: {
            id: id
        }
    });
    if (souvenirs.length != 0) {
        ctx.response.type = 'application/json';
        ctx.response.body = JSON.stringify(souvenirs);
    } else {
        ctx.response.body = {
            code: '2000',
            message: '纪念品记录不存在'
        };
    }
});

router.post('/souvenir/add', async (ctx, next) => {
    var
        name = ctx.request.body.name;
        price = ctx.request.body.price;
        stock = ctx.request.body.stock;
        available = ctx.request.body.available;
    if (name && price && stock && available) {
        var addSouvenir = await Souvenir.create({
            name: name,
            price: price,
            stock: stock,
            available: available
        });
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: '200',
            message: '成功'
        };
    } else {
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: '2001',
            message: '参数为空'
        };
    }
});

var queryFromSouvenir = async (id) => {
    var souvenirs = await Souvenir.findAll({
        where: {
            id: id
        }
    });
    return souvenirs;
}

router.post('/souvenir/delete', async (ctx, next) => {
    var
        id = ctx.request.body.id;
    if (id) {
        var souvenirs = await queryFromSouvenir(id);
        if (souvenirs.length != 0) {
            for (let s of souvenirs) {
                await s.destroy();
            }
            ctx.response.type = 'application/json';
            ctx.response.body = {
                code: '200',
                message: '成功'
            };
        } else {
            ctx.response.type = 'application/json';
            ctx.response.body = {
                code: '2002',
                message: '纪念品记录不存在'
            };
        }
    } else {
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: '2001',
            message: '参数为空'
        };
    }
});

router.post('/souvenir/update', async (ctx, next) => {
    var
        id = ctx.request.body.id;
        name = ctx.request.body.name || '';
        price = ctx.request.body.price || '';
        stock = ctx.request.body.stock || '';
        available = ctx.request.body.available || '';
    if (id) {
        var souvenirs = await queryFromSouvenir(id);
        if (souvenirs.length != 0) {
            for (let s of souvenirs) {
                s.name = name == '' ? s.name : name;
                s.price = price == '' ? s.price : price;
                s.stock = stock == '' ? s.stock : stock;
                s.available = available == '' ? s.available : available;
                await s.save();
            }
            ctx.response.type = 'application/json';
            ctx.response.body = {
                code: '200',
                message: '成功'
            };
        } else {
            ctx.response.type = 'application/json';
            ctx.response.body = {
                code: '2002',
                message: '记录不存在'
            };
        }
    } else {
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: '2001',
            message: '参数为空'
        };
    }
});

router.post('/souvenir/sell/', async (ctx, next) => {
    var
        orderInfo = ctx.request.body.orderInfo;
        orderTotal = ctx.request.body.orderTotal;
        customerName = ctx.request.body.customerName;
        customerCommittee = ctx.request.body.customerCommittee;
        customerHotel = ctx.request.body.customerHotel;
        customerPhone = ctx.request.body.customerPhone;
        orderTime = ctx.request.body.orderTime;
        operator = ctx.request.body.operator;
        confirmed = ctx.request.body.confirmed;
        note = ctx.request.body.note;
    if (orderInfo && orderTotal && orderTime) {
        var addOrder = await Order.create({
            order_info: orderInfo,
            order_total: orderTotal,
            customer_name: customerName,
            customer_committee: customerCommittee,
            customer_hotel: customerHotel,
            customer_phone: customerPhone,
            order_time: orderTime,
            operator: operator,
            confirmed: confirmed,
            note: note
        });
        var orderInfoList = JSON.parse(orderInfo);
        for (var i = 0; i < orderInfoList.length; i++) {
            var souvenirs = await queryFromSouvenir(orderInfoList[i].id);
            if (souvenirs.length != 0) {
                for (let s of souvenirs) {
                    s.available = s.available - orderInfoList[i].num;
                    await s.save();
                }
            }
        }
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: '200',
            message: '销售成功'
        };
    } else {
        ctx.response.type = 'application/json';
        ctx.response.body = {
            code: '2001',
            message: '参数为空'
        };
    }
});

router.get('/order/confirm/:id', async (ctx, next) => {
    var id = ctx.params.id;
    var orders = await Order.findAll({
        where: {
            id: id
        }
    });
    if (orders.length != 0) {
        for (let o of orders) {
            o.confirmed = true;
            await o.save();
        }
        ctx.response.body = {
            code: '200',
            message: '确认成功'
        };
    } else {
        ctx.response.body = {
            code: '2000',
            message: '订单记录不存在'
        };
    }
});

router.get('/order/list', async (ctx, next) => {
    var orders = await Order.findAll();
    if (orders.length != 0) {
        ctx.response.type = 'application/json';
        ctx.response.body = JSON.stringify(orders);
    } else {
        ctx.response.body = {
            code: '2000',
            message: '订单记录不存在'
        };
    }
});

router.get('/order/detail/:id', async (ctx, next) => {
    var id = ctx.params.id;
    var orders = await Order.findAll({
        where: {
            id: id
        }
    });
    if (orders.length != 0) {
        ctx.response.type = 'application/json';
        ctx.response.body = JSON.stringify(orders);
    } else {
        ctx.response.body = {
            code: '2000',
            message: '订单记录不存在'
        };
    }
});

app.use(bodyParser());

// add router middleware:
app.use(router.routes());

app.listen(12000, 'localhost');