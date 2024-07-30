import express, { Request, Response } from 'express';
import { join } from 'path';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const port = 3000;

app.use(express.static(join(__dirname, '../dist')));

// Start main HTML page
app.get('/', (req: Request, res: Response) => {
    res.sendFile(join(__dirname, '../dist/html/login.html'));
});

// Get all employees
app.get('/emp', async (req: Request, res: Response) => {
    try {
        const response = await axios.get('http://127.0.0.1:5000/ec');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Flask API:', error);
        res.status(500).send('Error fetching data');
    }
});

// Get all companies
app.get('/comp', async (req: Request, res: Response) => {
    try {
        const response = await axios.get('http://127.0.0.1:5000/comp');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Flask API:', error);
        res.status(500).send('Error fetching data');
    }
});

// Sending login data to the backEnd
app.get('/empInfo', async (req: Request, res: Response) => {
    const { mail, pass } = req.query;

    try {
        const response = await axios.post('http://127.0.0.1:5000/empInfo', {
            mail: mail,
            pass: pass
        });
        const usermail = response.data.mail;
        const result: boolean = response.data.authenticated;
        res.json({ authenticated: result, user: usermail });
    } catch (error) {
        console.error('Error sending data to Flask:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send data to Flask'
        });
    }
});

// Get ID from mainPage.js and send it to the backend to delete it
app.get('/empId', async (req: Request, res: Response) => {
    const id = req.query.id as string;
    try {
        await axios.delete(`http://127.0.0.1:5000/emp/${id}`);
        res.status(200).send('Employee deleted successfully');
    } catch (error) {
        console.log('Error sending data to Python:', error);
        res.status(500).send('Error deleting employee');
    }
});

// Update employee using ID
app.post('/empUpdated', upload.single('image'), async (req: Request, res: Response) => {
    const employee = req.body.employee;
    const image = req.file;
    const formData = new FormData();
    formData.append('updatedEmployee', employee);

    if (image) {
        formData.append('file', image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
        });
    }
    try {
        const response = await axios.put(`http://127.0.0.1:5000/emp/${JSON.parse(employee).id}`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        res.status(200).send('Employee updated successfully');
    } catch (error) {
        console.log('Error updating employee info:', error);
        res.status(500).send('Error updating employee');
    }
});

// Add new employee
app.post('/empNew', upload.single('image'), async (req: Request, res: Response) => {
    const employee = req.body.employee;
    const image = req.file;
    const formData = new FormData();
    formData.append('newEmployee', employee);

    if (image) {
        formData.append('file', image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
        });
    }

    try {
        const response = await axios.post(`http://127.0.0.1:5000/emp`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        res.json(response.data);
    } catch (error) {
        console.log('Error updating employee info:', error);
        res.status(500).send('Error updating employee');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});