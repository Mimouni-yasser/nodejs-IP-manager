const express = require('express');
const Sequelize = require('sequelize');
const url = require('url');
const path = require('path');
const Op = Sequelize.Op;

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: 'db.sqlite3',
});

const Device = sequelize.define('IPs', {
  id: {
	type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
	},
 	IP: Sequelize.STRING,
  	MAC: Sequelize.STRING,
	comment: Sequelize.STRING,
  device_type: Sequelize.STRING,
	DateTime: Sequelize.DATE,
}, {
  timestamps: false,
  tableName: 'manager_ip_field'
});

const app = express();
const port = 3000;

// Serve static assets from the "public" directory
app.use(express.static(path.join(__dirname)));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
// Route for serving the index.html page
app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/add', (req, res) =>{

  deviceIP = req.body.ip
  deviceMAC = req.body.mac
  deviceComm = req.body.comment
  devicetype = req.body.type

  Device.findAll({
    where:
    {
      IP:
      {
        [Op.like]:  `%${deviceIP}%`,
      },
      MAC:
      {
        [Op.like]:  `%${deviceMAC}%`,
      },
      comment:
      {
        [Op.like]:  `%${deviceComm}%`,
      },
      device_type:
      {
        [Op.like]:  `%${devicetype}%`,
      }
    }
  }).then(device => {
    if (device.length > 0) {
      res.end('device exists already')
    }
    else
    {
      Device.create({
        IP: deviceIP,
        MAC: deviceMAC,
        comment: deviceComm,
        DateTime: new Date(),
        device_type: devicetype,
      }).then(newDevice => {
        console.log('New device created:', newDevice.get());
        res.statusCode = 200
        res.end('ok')
        })
      }

  });
})

app.post('/delete', (req, res) => 
{
  const deviceId = req.body.pk;

  Device.destroy({
    where: {
      id: deviceId,
    },
  }).then(() => {
    res.status(200).send('ok');
  }).catch(error => {
    res.status(500).send('Server error');
  });
});


app.post('/modify', (req, res) => 
{
  const deviceId = req.body.pk;
  deviceIP = req.body.ip
  deviceMAC = req.body.mac
  deviceComm = req.body.comment
  devicetype = req.body.type

  Device.update(
    {
      IP: deviceIP,
      MAC: deviceMAC,
      comment: deviceComm,
      DateTime: new Date(),
      device_type: devicetype,
    },
    {
      where: {
        ID: deviceId,
      },
    }
  ).then(() => {
    res.status(200).send('ok');
  }).catch(error => {
    res.status(500).send('Server error');
  });
});

// Route for looking up devices by ID
app.get('/getDevice', (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const deviceIP = parsedUrl.query.ip===undefined ? '':parsedUrl.query.ip;
  const deviceMAC = parsedUrl.query.mac===undefined ? '':parsedUrl.query.mac;
  const deviceComm = parsedUrl.query.comment===undefined ? '':parsedUrl.query.comment;
  const devicetype = parsedUrl.query.type===undefined ? '':parsedUrl.query.type;

    Device.findAll({
      where:
      {
        IP:
        {
          [Op.like]:  `%${deviceIP}%`,
        },
        MAC:
        {
          [Op.like]:  `%${deviceMAC}%`,
        },
        comment:
        {
          [Op.like]:  `%${deviceComm}%`,
        },
        device_type:
        {
          [Op.like]:  `%${devicetype}%`,
        }
      }
    }).then(device => {
      if (device) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(device));
      } else {
        res.statusCode = 404;
        res.end('Device not found');
      }
    }).catch(error => {
      res.statusCode = 500;
      res.end('Server error');
    });
});

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
