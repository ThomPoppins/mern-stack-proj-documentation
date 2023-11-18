
### Profile page (with gender specific placeholder profile picture)

**When you register an account your profile is very empty and your profile picture is a placeholder, a male for men and for women a female picture placeholder.**

![Profile Page Placeholder Profile Picture](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/002.png?raw=true)

### Profile picture upload modal

**After logging in for the first time, users can click on the`upload` button on the placeholder profile picture for uploading their first profile picture. After clicking the button, a modal will pop up where you can upload a image file by clicking on the `browse...` button and select an image locally from their device.**

![Image Upload Modal Pop-Up](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/003.png?raw=true)

### Profile picture preview before upload

**After selecting a image local from their device, a preview will be shown of what image it would be.**

![Profile Picture Modal Preview](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/004.png?raw=true)

If the user wants can he/she still change their mind and choose a different one or cancel the upload because the image is not yet uploaded. The image preview is a Base64 URL encoded image.

#### BLOB image

> **Definition:** A binary large object (BLOB or blob) is a collection of binary data stored as a single entity. Blobs are typically images, audio or other multimedia objects, though sometimes binary executable code is stored as a blob.

```javascript
<img src={blobValueString} />
```

> **Source:** [/frontend/src/components/users/EditProfilePicture.jsx](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/frontend/src/components/users/EditProfilePictureModal.jsx)

```javascript
// Modal to edit user profile picture
const EditProfilePictureModal = ({ userId, onClose }) => {
  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState('')

  // Handle file select
  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined)
      return
    }

    setSelectedFile(e.target.files[0])
  }

  // Set the preview image
  useEffect(() => {
    if (!selectedFile) {
      setPreview('')
      return
    }
    // Convert the selected image to a Base64 string and save it to the preview state
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    // Free memory when the preview is closed
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  // ... (rest of the component before it's return statement)

  return (

  // ... (start return JSX)

  {selectedFile ? <img
    alt="Profile Picture"
    className="mx-auto my-4 w-[350px] h-[350px] object-cover"
    src={preview} // BLOB image string is set as img src as is.
  /> : null}

  // ... (end return JSX)

  )
}

export default EditProfilePictureModal
```

#### Save image to the backend server

If the user is sure about it, he/she will click the upload button and now the image will be sent through a form-data object to the backend REST (ExpressJS hosted) POST image upload API end-point, where the image will be recieved by _ExpressJS_, using _Multer_ middleware for disk storage configuration and file handling and saved in a special public static file directory, local on the server storage.

After the image is uploaded and saved, a corresponding Image "document" (entry) with a filepath will be saved to the MongoDB database in the "images" collection. (A collection is like a database table.)

> **Source:** [/backend/routes/uploadRoute.js](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/routes/uploadRoute.js)

```javascript
import { Image } from '../models/imageModel.js'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'

const router = express.Router()

// Create Multer storage configuration
const storage = multer.diskStorage({
  // `destination` is the folder where the uploaded file will be stored.
  destination(request, file, callback) {
    callback(null, './public/uploads/images')
  },

  fileFilter(request, file, callback) {
    // Accept images only.
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      // Send status 400 response if the file is not an image and a (error) message to inform the client.
      return callback(new Error('Only images allowed!'))
    }
    // Image file is accepted. Pass `true` to the callback.
    callback(null, true)
  },

  // Filename is the name of the uploaded file.
  filename(request, file, callback) {
    // The file name will be the original name of the uploaded file with a timestamp.
    const fileName = file.originalname.split('.')[0]
    const fileExtension = file.originalname.split('.')[1]
    const timestamp = Date.now()
    // `callback` is used to pass the file name to multer.
    callback(null, `${fileName}-${timestamp}.${fileExtension}`)
  },
})

// Create multer instance with the storage configuration.
const upload = multer({ storage })

// The POST image upload route uses Multer middleware as you can see, the Multer object is provided as second argument.
// Multer will first process the request and pass on the result to the 3rd argument function of the route
router.post('/image', upload.single('image'), async (request, response) => {
  if (!request.file) {
    console.log('No image file. `request`: ', request)

    return response.status(400).send({
      message: 'No image uploaded.',
    })
  }

  // Prepare response object to send to client with image path and database Image._id.
  const responseObj = {
    message: 'Image uploaded successfully!',
    imagePath: request.file.path,
    imageId: new mongoose.Types.ObjectId(),
  }

  // Create Instance of Image model with the image path to safe as document in the MongoDB Image collection
  const image = new Image({
    path: request.file.path,
  })

  // Save new Image document to database
  await image
    .save()
    .then((result) => {
      responseObj.imageId = result._id
    })
    .catch((error) =>
      response.status(500).send({
        message: `Error saving image to database! ${error.message}`,
      }),
    )

  return response.status(200).send(responseObj)
})

export default router
```

After successfully saving the new Image entry (document) to the database, MongoDB responds with the Image document ID, which will immediately be saved to the User document(of the currently logged in user of course) so it will be always be certain where the image is. Securely saved on the backend server with the file location saved to the database with it's Image ID saved in the corresponding User document.

#### Express.static() as CDN

The image is served by ExpressJS which means this backend is also the CDN. Because of this intentional set up,the client server will always be clean of accumulating images and any other kind of files and trash and will the heavy duty of handling large file with a lot of data rest on the backend where a performance impact would have a lot less impact on the U(ser)X(perience).

Express.js can serve static files using **Express.static("public_directory")**.

> **Source:** [/backend/index.js](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/index.js)

```javascript
// Use .static() and configure the /public folder for hosting static resources as CDN for images and other files.
app.use(express.static("public"))
```

> **Note:** All URL's to the files in the public directory have a similar URL structure. An image within the public static files directory with path **public_static_files_dir/uploads/images/137917151-1699497672476.jpg** can be accessed on URL _backend-server-domain.com/uploads/images/137917151-1699497672476.jpg_.

### User profile page and data structure

_Profile page:_
![Profile Page With Profile Picture](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/005.png?raw=true)

At this point there are only a few details a user can set when registering a new account. Of course this will be expend (largely) in the future. For now in this stage of the development process of the application, it's useful to keep minimalistic, clean and keep everything simple now there is not any dependency on yet and over complicate everything. Dependencies for users details could be a detailed profile pages, location/address information, media, posts on a timeline (or feed) or many other things users would want to save personally to their account eventually.

#### `User` schema

**Schema fields:**

- **username**

  - _Type_: String
  - _Required_: true
  - _Unique_: true
  - _Default_: ''

- **email**

  - _Type_: String
  - _Required_: true
  - _Unique_: true
  - _Default_: ''

- **hashedPassword**

  - _Type_: String
  - _Required_: true
  - _Default_: ''

- **firstName**

  - _Type_: String
  - _Required_: true
  - _Default_: ''

- **lastName**

  - _Type_: String
  - _Required_: true
  - _Default_: ''

- **gender**

  - _Type_: String
  - _Required_: true
  - _Description_: Represents the gender of the user. Can be "Man," "Woman," or "Other."

- **profilePicture**
  - _Type_: mongoose.Schema.Types.ObjectId
  - _Ref_: 'Image'
  - _Description:_ This field is an ID reference to the image document in the database image collection, containing the file path local to the CDN (ExpressJS backend) server from which image file is being served. This allows for the image to be retrieved from the CDN (ExpressJS backend server) and displayed on the client-side application page based on a URL relative to the CDN server that can logically be generated from the image document's file path. This way no hard coded URLs are needed to be saved in MongoDB database and the image documents will be served independent of the backend server domain address making the image documents portable and reusable in different production and development environments and allowing easy migration of the image files to a different storage and host with a different URL/domain.

_Additional fields:_

- **timestamps**
  - Type: Object
  - Description: Automatically adds `createdAt` and `updatedAt` fields to the user doc

**Mongoose:**

- The **Mongoose** schema establishes the data structure for the user information within the database.
- It enforces uniqueness for each user's username and email to prevent double sign-ups and ensuring secure storage of their hashed password.
  User details like `firstName`, `lastName`, `gender`and a reference field to the profile picture image document called `profilePicture`.
- The `User` schema describing the data structure of the MongoDB `User` documents in the `users` collection is defined in the [backend server](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/models/userModel.js).
- The `User` schema is described and defined using Mongoose, a popular _Object Data Modeling (ODM)_ library for MongoDB and Node.js.
- The `User` schema is expected to extends with many fields when continued development will many more dependencies on user data when the application grows and complexity increases.

> **Source:** [/backend/models/userModel.js](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/models/userModel.js):

```javascript
// Instantiate User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      default: "",
    },
    hashedPassword: {
      type: String,
      required: true,
      default: "",
    },
    firstName: {
      type: String,
      required: true,
      default: "",
    },
    lastName: {
      type: String,
      required: true,
      default: "",
    },
    gender: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
  },
  { timestamps: true }
)
```

**Mongoose `User` model:**

- The User model is created using the mongoose.model function, which takes the name 'User' and the user schema as arguments.
- This model (`User`) serves as an interface to interact with the MongoDB database based on the defined schema.
- The model (`User`) is directly tied to the schema (`userSchema`).
- When you use methods like User.create(), User.find(), or others, Mongoose ensures that the data aligns with the structure defined in the schema.

> _[/backend/models/userModel.js](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/models/userModel.js):_

```javascript
// Instantiate User model
const User = mongoose.model("User", userSchema)
```

### Companies

#### Listing page

On the /companies page the user can see all companies that he owns and has the choice between listing the companies in _card_ view or in _table_ view. The view of choice will be saved as a Redux state so the user preference will be kept as long as they are logged in. I am planning to save this configuration to the database so the user preference will never be lost and can be dispatched to the Redux state every time they log in to their account.

> **Note:** I opened the dropdown menu.

_Card view:_
![Companies Listing Page Card View](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/007.png?raw=true)

_Table view:_
![Companies Listing Page Table View](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/006.png?raw=true)

When the user clicks on the _eye_ icon on a listed company, a modal will pop up that will display the main and most important public company information so the owner of the company can check the company current state quickly at a glance without having to navigate to another company specific details page and lose track of what they were doing or planning to do from the companies listing page.

> **Note:** At this stage in development, companies do not have that many details yet to show. There will be a lot of work to these pages yet and they do not reflect a final version.

![Show Company Details Modal](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/008.png?raw=true)

#### Registration

An owner of a company can register his company in my application. On this companies listing page you see a green `+` icon in the top right corner. When a user clicks on that, he will navigate to the company register page where the user can register a new company that hasn't registered yet by filling in a company registration form.

_Company registration form:_
![Company Registration Form Top](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/008.1.png?raw=true)
![Company Registration Form Bottom](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/008.2.png?raw=true)

#### Form field validation

All form input fields in my application have to be validated. I've written my own validators for all fields. I've used regular expressions to make sure it is correct data as I expect to receive from the user input.

**Example validator:**

> **Source:** [/frontend/utils/validation/emailValidator.js](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/frontend/src/utils/validation/emailValidator.jsx)

 ```javascript
const emailValidator = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u
  return regex.test(email)
}

export default emailValidator
 ```

**Invalid value notifications:**

![Invalid Values Error Notifications](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Invalid-Form-Values.png?raw=true)

**Code example communicating invalid values in the UI of company registration page:**

> **Source:** [/frontend/src/pages/companies/RegisterCompany.jsx](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/frontend/src/pages/companies/RegisterCompany.jsx)

 ```javascript
 import React, { useEffect, useState } from 'react'
 import axios from 'axios'
 import { useSnackbar } from 'notistack'
 import emailValidator from '../../utils/validation/emailValidator'
// ... (and a lot of other imports and validator imports here)

const RegisterCompany = () => {
  const [name, setName] = useState(''),
  // email form field input value
    [email, setEmail] = useState(''),
    // ... (states for all other form field values)
    // If value is invalid, emailError would become true
    [nameError, setNameError] = useState(false),
    [emailError, setEmailError] = useState(false),
    // ... (errors states for all form fields here)
    // useSnackbar is a hook that allows us to show a notification that pops up in the left bottom corder (see image above)
    { enqueueSnackbar } = useSnackbar()

  // Functions that will call the name and email validators and sets the error state dependent on the return value from the validators. 
  // This function is called directly by the onBlur event listener on the name and email input fields, so it is called when the input 
  // field loses focus.
  const validateCompanyName = () => {
      if (companyNameValidator(name)) {
        setNameError(false)
      } else {
        setNameError(true)
      }
    },
    validateEmail = () => {
      if (emailValidator(email)) {
        setEmailError(false)
      } else {
        setEmailError(true)
      }
    },
    // ... (a lot of other validateFormField() functions here)

  // Handle onChange events for all input fields
  const handleNameChange = (event) => {
      setName(event.target.value)
      if (nameError) {
        validateCompanyName()
      }
    },
    handleEmailChange = (event) => {
      
      setEmail(event.target.value)
      
      if (emailError) {
        validateEmail()
      }
    },
  // ... (a lot of input field change handlers here)

  // Handle onChange events for all input fields
  const handleNameChange = (event) => {
      // Set the name state to the current name input field value
      setName(event.target.value)
      if (nameError) {
        // Only IF the name error state is ALREADY true, then validate name always onChange. This prevents a notification when the user 
        // hasn't completed his input and would otherwise already show after typing the first character in to the field. onBlur() 
        //calls the validateName function initially after losing focus the first time.
        validateCompanyName()
      }
    },
    handleEmailChange = (event) => {
      // Set the email state to the current email input field value
      setEmail(event.target.value)
      if (emailError) {
        // Only IF the email error state is ALREADY true, then validate email always onChange. Initially called by onBlur like the name field.
        validateEmail()
      }
    },
    // ... (here all other onChange handler for the other input fields)

  // Display error messages if the user enters invalid input with useSnackbar
  useEffect(() => {
    if (nameError) {
      // Trigger snackbar notification
      enqueueSnackbar('Company name is invalid!', {
        variant: 'error', // Display notification in a red box
        preventDuplicate: true, // Prevents notification spamming
      })
    }
    // Trigger snackbar notification
    if (emailError) {
      enqueueSnackbar('Email is invalid!', {
        variant: 'error', // Display notification in a red box
        preventDuplicate: true, // Prevents notification spamming
      })
    }
    // ... (rest of the input field if statement whether to display a invalid value error notification)
  }, [
    // This dependency array is set to the error states of the input fields. Every time a state value from this array changes, 
    // this useEffect hook function will trigger.
    nameError,
    emailError,
    phoneError,
    kvkNumberError,
    sloganError,
    descriptionError,
    startYearError,
  ])

  // Function that is being called when the user presses the Save button.
  const handleSaveCompany = async () => {
    // Validate all fields before sending the request to the backend, otherwise return
    validateCompanyName()
    validateEmail()
    // ... (validate other fields here)

    // If there are any invalid form fields left, notify the active user and return without saving and without redirect.
    if (
      nameError ||
      emailError ||
      phoneError ||
      kvkNumberError ||
      sloganError ||
      startYearError ||
      !name ||
      !email ||
      !phone ||
      !kvkNumber ||
      !slogan ||
      !startYear
    ) {
      enqueueSnackbar(
        'Please fill in all fields correctly before saving this company!',
        {
          variant: 'error',
          preventDuplicate: true,
        },
      )
      return
    }

    // If all values are correct, prepare object for company save request
    const data = {
      name,
      logo,
      email,
      phone,
      kvkNumber,
      slogan,
      startYear,
      description,
      owners: [{ userId }],
    }
    // Render loading animation for as long as the request takes
    setLoading(true)
    axios
      .post(`${BACKEND_URL}/companies`, data)
      .then(() => {
        // Saving company success
        // Stop loading animation
        setLoading(false)
        // Notify the user about success
        enqueueSnackbar('Company registered successfully!', {
          variant: 'success',
          preventDuplicate: true,
        })
        // Redirect back to companies listing page
        navigate('/companies')
      })
      .catch((error) => {
        // If request failed notify active user accordingly to the problem that occurred.
        // Company with the KvK number already existed, is not unique
        if (error.response.status === 409) {
          enqueueSnackbar('Company with this KVK number already exists!', {
            variant: 'error',
            preventDuplicate: true,
          })
          // Set KvK error to true
          setKvkNumberError(true)
          // Display a more fitting message below the input field.
          setKvkNumberErrorMessage(
            'Company with this KVK number already exists!',
          )
        }
        // Disable animation
        setLoading(false)
        // Always notify user saving company failed
        enqueueSnackbar('Error registering company!', {
          variant: 'error',
          preventDuplicate: true,
        })
      })
  }

  return (
    // ... (Top of the register page)

      <div className='my-4'>
        <label className='text-xl mr-4' htmlFor='company-name-input'>
          Name
        </label>
        <input
          className={`border-2 border-purple-900 bg-cyan-100 focus:bg-white rounded-xl text-gray-800 px-4 py-2 w-full ${
            nameError ? 'border-red-500' : ''
          }`}
          data-test-id='company-name-input'
          id='company-name-input'
          onBlur={validateCompanyName} // onBlur event validate name field function call
          onChange={handleNameChange} // onChange event name field change handler function call
          type='text'
          value={name}
        />
        { /* Conditionally render the error notification text below the input field: */}
        {nameError ? (
          <p className='text-red-500 text-sm'>
            Company name must be between 1 and 60 characters long and can
            only contain letters, numbers, spaces, and the following
            characters: &#45;, &apos;, and &#46;
          </p>
        ) : (
          ''
        )}
      </div>
      <div className='my-4'>
        <label className='text-xl mr-4' htmlFor='company-email-input'>
          Email
        </label>
        <input
          className={`border-2 border-purple-900 bg-cyan-100 focus:bg-white rounded-xl text-gray-800 px-4 py-2 w-full ${
            emailError ? 'border-red-500' : ''
          }`}
          data-test-id='company-email-input'
          id='company-email-input'
          onBlur={validateEmail} // onBlur event validate email field function call
          onChange={handleEmailChange} // onChange event email field change handler function call
          type='text'
          value={email}
        />
        { /* Conditionally render the error notification text below the input field: */}
        {emailError ? (
          <p className='text-red-500 text-sm'>
            Email must be a valid email address.
          </p>
        ) : (
          ''
        )}
      </div>
  )
 ```

##### KVK number validation

![Invalid KvK Number](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Invalid-KvK-Number.png?raw=true)

Companies in the Netherlands (my home country) are always registered to the "Kamer van Koophandel" which is the Chamber of Commerce in the Netherlands. It is a government agency that plays a crucial role in the registration and documentation of businesses operating in my country.

I've connected the backend application to the KvK test API for validation of company KvK numbers. When a user registers a company to my application and fills in the KvK number, when the input field loses focus (`onBlur()`), automatically there will be a request to the KvK (test) API for KvK number validation.

**GET route to get KvK data:**

> **Source:** [/backend/routes/kvkRoute.js](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/routes/kvkRoute.js)

```javascript
import { getKvkData } from '../controllers/kvkController.js'
import express from 'express'
import cors from 'cors'

const router = express.Router()

// GET route to get KvK data from the KvK API by KvK number
router.get('/', cors(), getKvkData)

export default router
```

**KvK controller for handling request:**

> **Source:** [/backend/controllers/kvkController.js](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/controllers/kvkController.js)

```javascript
import axios from 'axios'
import fs from 'fs'
import https from 'https'
import { KVK_TEST_API_KEY } from '../config.js'

const PATH_TO_KVK_API_CERTIFICATE_CHAIN_RELATIVE_TO_INDEX_APP =
  './certs/kvkApi/Private_G1_chain.pem'

// Function to get data from the KVK API
export const getKvkData = async (request, response) => {
  try {
    // Get the query from the request query parameters
    const { kvkNumber } = request.query,
      // Get the certificate chain from the file system
      certificateChain = fs.readFileSync(
        PATH_TO_KVK_API_CERTIFICATE_CHAIN_RELATIVE_TO_INDEX_APP,
        'utf8',
      ),
      // Create an https agent with the certificate chain
      // https://nodejs.org/api/https.html#https_https_request_options_callback
      agent = new https.Agent({
        ca: certificateChain,
      }),
      // Get the data from the KVK API GET request
      { data } = await axios.get(
        `https://api.kvk.nl/test/api/v1/naamgevingen/kvknummer/${kvkNumber}`,
        {
          headers: {
            apikey: KVK_TEST_API_KEY,
          },
          httpsAgent: agent,
        },
      )

    // Send status 200 response and the data to the client
    return response.status(200).json(data)
  } catch (error) {
    console.log('Error in GET /kvk: ', error)
    // If the error is a 400 error, send a 400 response with the error message
    if (error.response.status === 400) {
      return response.status(400).send({ message: error.message })
    }
    // Else, send a 500 response with the error message
    return response.status(500).send({ message: error.message })
  }
}
```

For now, only number validation is enough, but in the future also the company name, owners and other company details will be verified against this API to rule out the need for human verification as much as possible to safe costs and make the user experience a much faster because users can get started with their company in the application right away without having to wait for a manual verification of their business.

**Subsidiary companies:**:
KvK numbers have to be unique so companies can't get registered more then once, in the future this uniqueness has to be combination between Kvk number and company name (and also maybe other company details) because companies can have subsidiary companies with the same number and these subsidiary companies should be able to be registered as valid companies to the application because for a regular user using the app to find a company they need, it is not important to know that a company has a parent company. If companies find it necessary to inform the regular user (and potential customer) about their subsidiarity of a parent company, then they should be able to inform users about that on their company profile page (in very early development).

#### `Company` document data structure

When I first got the business idea for building this application I decided to make companies the main central starting point to focus on, find out what is necessary to get companies on board with my application and want to register and pay for premium features. Almost the first thing I started building was a company model that has all required fields where companies would be dependent on realizing the ideas I have in mind for my application, resulting in a `Company` model with many fields. At this stage of development only a few of there defined fields are actually used and populated with data at the moment, but because it is not a requirement to populate every field with data before saving and editing `Company` documents in the database, I feel no need to simplify the model for the time being at all.

#### `Company` schema

**Schema fields:**

1. **Name:**

   - Type: String
   - Required: true
   - Description: The name of the company.

2. **Logo:**

   - Type: String (Base64 format)
   - Required: false
   - Default: ""
   - Description: The company's logo (still) in Base64 format.

3. **Email:**

   - Type: String
   - Required: true
   - Default: ""
   - Description: The company's email address for correspondence.

4. **Phone:**

   - Type: String
   - Required: true
   - Default: ""
   - Description: The company's contact phone number.

5. **KVK Number:**

   - Type: String
   - Required: true
   - Unique: true
   - Default: ""
   - Description: Kamer van Koophandel (KVK) number of the company.

6. **KVK Validated:**

   - Type: Boolean
   - Required: true
   - Default: false
   - Description: Indicates whether the KVK number is validated using the already fully functional and authenticated KVK test API end point connection.

7. **Slogan:**

   - Type: String
   - Required: true
   - Default: ""
   - Description: The company's slogan.

8. **Description:**

   - Type: String
   - Required: true
   - Default: ""
   - Description: A short description of the company.

9. **Address:**

   - Type: Object
   - Required: false
   - Default: {}
   - Description: The registered address of the company.

10. **Billing Address:**

    - Type: Object
    - Required: false
    - Default: {}
    - Description: The address to send invoices to.

11. **Address Format:**

    - Type: ObjectId (Reference to Address Format model)
    - Required: false
    - Default: null
    - Description: The country specific address format of the country the registered company is in.

12. **Country:**

    - Type: String
    - Required: false
    - Default: "NL"
    - Description: The country of the company's billing address.

13. **Region:**

    - Type: String
    - Required: false
    - Default: ""
    - Description: The region of the company's billing address.

14. **Owners:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of objects containing owner their `User` `ObjectId`'s corresponding with their documents' ID in the of the `users` collection. Owners will always have the right to admin level access to company configuration and can disable admin level access to these configurations any time for safety, they can also enable these admin rights whenever is necessary and will be prompted regularly to disable the elevated admin access to prevent any unintended possible disasters (like deleting the company by accident and losing all reviews, score and status).

15. **Company Admins:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of `ObjectId`'s containing company admins `User` ID's who have elevated access to Company configuration. Admins have elevated access to company configurations and can disable admin level accessibility to these configurations any time for safety, they can also enable these admin rights whenever is necessary and will be prompted regularly to disable the elevated admin access to prevent any unintended possible disasters just like owners. Admins have the right to add other admins to a company when they have elevated access enabled, but initially a company owner with elevated access had to add the first admin (who is not company owner).

16. **Locations:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of objects representing company locations. This will be `ObjectId`s corresponding to `Address` documents in the `address` collection.

17. **Departments:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of objects representing company departments. To be decided the format this will be in.

18. **Business Config:**

    - Type: Object
    - Required: false
    - Default: {}
    - Description: Configurable settings for company owners and admins with elevated access enabled.

19. **Payment Details:**

    - Type: Object
    - Required: false
    - Default: {}
    - Description: Payment details for the company. Think about anything solely necessary for financial transactions in any direction.

20. **Start Year:**

    - Type: Number
    - Required: false
    - Default: 0
    - Description: The year the company was started.

21. **Active:**

    - Type: Boolean
    - Required: false
    - Default: true
    - Description: Indicates if the company is currently active. (Open for business)

22. **Industries:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of industries associated with the company for grouping companies and search result improvement.

23. **Public:**

    - Type: Boolean
    - Required: false
    - Default: true
    - Description: Indicates if the company is public or private.

24. **Reviews:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of `ObjectId`s of `Review` documents in the `review` collection in the database representing this companies' reviews.

25. **Rating:**

    - Type: Number
    - Required: false
    - Min: 0
    - Max: 5
    - Default: 0
    - Description: The overall rating of the company. Every `User` can vote on this only a single time but might be able to edit their rating of the company. In what format ratings should be tracked and saved is to be decided.

26. **Customers:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of customers `User` `ObjectId`s in from the `users` collection in database.

27. **Premium:**

    - Type: ObjectId (Reference to Premium Type model)
    - Required: false
    - Default: null
    - Description: The premium type associated with the company. Like "none" "bronze", "silver", "gold" or "platinum". What every premium subscription level has to cost and what advantages or features these provide for subscribed companies is to be decided, think about company profile cosmetic changes or being able to have actions, discounts or events, BUT companies will never be able to pay for a higher place in the search result because that defeats the purpose of this application completely.

28. **Vendor:**

    - Type: ObjectId (Reference to Vendor model)
    - Required: false
    - Default: null
    - Description: Can this company sell to other companies? If so, this company will be marked as vendor and probably have a corresponding `Vendor` document in the (yet un-existing) `vendors` collection where all to vendors specific data will be saved.

29. **Employees:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of `User` `ObjectId`'s of users who accepted the `Invite` to become employee of this company and will be able to have some functionalities within this company like writing `Story` posts under their own name and communicate with (potential) customers (users of this application).

30. **Stories:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: `ObjectId`'s of `Story` documents in the `stories` collection. Stories are posts placed on a timeline where you can see what the company has been active in lately and in the past. Stories can differ a lot from one another, companies have to be able to have a large spectrum of possibilities adding stories that fit their wishes.

31. **Products:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: Products a company can offer and users can buy. Probably will be an array of `ObjectId`'s, but have to decide how to structure product data. Maybe product selling functionality would require a compete new platform to be with a realtime connection synchronizing with this application.

32. **Services:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: A company can offer and sell services to users. The exact format this will be build in is to be decided.

33. **Agenda:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of agenda objects associated with the company. Format is to be decided.

34. **Appointments:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of appointments with users and other companies, format is to be decided.

35. **Messages:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: Corresponds with messages in the `messages` collection `ObjectId`'s of `Message` documents. Still need to decide on the messages' format and data structure.

36. **Notifications:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: An array of corresponding `Notification` documents'

37. **Events:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: `ObjectId`'s corresponding to `Event` documents in the `events` collection. Events could be anything that is organized and it is still to decide in which many ways and configurations events could be created by users of the application.

38. **Tasks:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: Array of `ObjectId`'s of `Task` documents in the `tasks` collection. Could be anything a user or company could have to do and I will decide later on all the functionalities and data structure of tasks later on.

39. **Invoices:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: Array of `Invoice` document `ObjectId`'s in the `invoices` collection. `Invoice` data structure has to be decided on yet.

40. **Orders:**

    - Type: Array
    - Required: false
    - Default: []
    - Description: Array of `Order` document `ObjectId`'s in the `orders` collection which will contain all kind of orders users and companies could make and contains information of all order specific data like order status and much more.

41. **Payments:**

    - Type: Array
    - Required: false
    - Unique: true
    - Default: []
    - Description: Array of `Payment` document `ObjectId`'s in the `payments` collection which keeps track of all financial transactions between everybody.

42. **Main Image ID:**

    - Type: String
    - Required: false
    - Default: ""
    - Description: The main image should be the first thing people see when searching for a company and should be the _eye catcher_ of the company to attract people to look into them. This is meant to be a different image then the company logo, the logo is also displayed in the first glance of a user searching for a company but smaller in a corner (something like that).

43. **Images:**

    - Type: Array
    - Required: false
    - Description: An array of image objects associated with the company.

44. **Timestamps:**
    - Type: Object
    - Description: Automatically adds `createdAt` and `updatedAt` fields to the user doc

**Mongoose:**

- The **Mongoose** schema establishes the data structure for the company information within the database.
- It enforces uniqueness for each companies' KVK number to prevent double registrations.
- The `Company` model has a lot of fields not being populated with data yet, but the size of this model tells very clearly about what size of the application would become.

**Schema:**

```javascript
// Instantiate `Company` schema
const companySchema = new mongoose.Schema(
  {
    // ... (all schema fields are defined here)
  },
  { timestamps: true }
)
```

> **Note:** To see the complete code of the `Company` schema instantiation with all fields [here](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/backend/models/companyModel.js).

**Model:**

```javascript
// Instantiate `Company` model
const Company = mongoose.model("Company", companySchema)
```

#### Edit company

When a company owner clicks on the _pencil_ icon on the companies listing page the owner is able to edit the company.

![Edit Company Page](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Edit-Company.png?raw=true)
![Edit Company Page](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Edit-Company-2.png?raw=true)

#### Company ownership

Companies are automatically owned by the `User` that registers the company to the application.

If a company has more than one owner, the company owners is able to invite other users for company ownership, giving the other co-owners the same admin level elevated access to the configuration of their company.

_Find other users and invite them for co-ownership:_
![Find Other Users For Company Co-ownership](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Find-Other-Users-For-Company-Co-ownership.png?raw=true)

A company owner can find users of the application with the search box on the "edit company" page and send them a invite by clicking the `invite` button.

When a user is invited by the owner for co-ownership the user "result" will be removed from the search results list and a "Pending invites" section will appear with the invited user. I invited the user Kaya Lowe in this example.

![User Invited On Edit Company Page](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/User-Invited.png?raw=true)

> **Note:** In the future this `Invite` information will be the user details, but I have to make a future decision about where I want this data to be served from the backend to the client application, that's why it is only containing `ObjectId` information of the `Invite` document. See the `Invite` schema data structure [further down below](#invite-schema).

When the `User` is invited to become co-owner of the company, that user will receive a invite notification in the navigation bar.

![User Invited On Edit Company Page](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Invite-Notification.png?raw=true)

Clicking on the `Invites` dropdown menu item, the user will navigate to the invites page and be able to _Accept_ or _Decline_ the invite by clicking the buttons in the _Operations_ section in the _Invites_ table listing the pending invites.

![Invites Page](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Invites-Page.png?raw=true)

After clicking _Accept_ or _Decline_ and there is no pending invite left, the user will navigate to the companies listing page and the companies they accepted will be listed there with their name added as co-owner.

![Invite Accepted](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Invite-Accepted.png?raw=true)

> **Note:** The invite notification has disappeared, the _Invites_ dropdown menu item isn't listing anymore.

After accepting the invite, the _Owners_ section of the _edit company_ page is updated with the new owner and the _Pending invites_ Section disappeared since there are no pending invites left.

![Owners Section Updated](https://github.com/ThomPoppins/MERN_STACK_PROJ./blob/main/screenshots/Ownership-Section-Updated.png?raw=true)

> **Note:** In React I use _conditional rendering_ and _state management_ to easily always keep the UI up-to-date with the current state of the application when the state (current data) has been changed.

#### `Invite` schema

**Schema fields:**

1. **Sender ID:**

   - Type: mongoose.Schema.Types.ObjectId
   - Reference: "User"
   - Description: The ID of the user sending the invitation.

2. **Receiver ID:**

   - Type: mongoose.Schema.Types.ObjectId
   - Reference: "User"
   - Description: The ID of the user receiving the invitation.

3. **Kind:**

   - Type: String
   - Description: Specifies the type of invitation, with possible values: "company_ownership", "friend", "other". Default value is "other".

4. **Company ID:**

   - Type: mongoose.Schema.Types.ObjectId
   - Reference: "Company"
   - Description: If the invitation is related to company ownership, this field contains the ID of the associated company.

5. **Kind:**

   - Type: String
   - Default: "pending"
   - Description: Represents the status of the invitation. Only four possible values: "pending", "accepted", "declined", and "canceled".

6. **Timestamps:**
   - Type: Automatically generated timestamps for document creation and modification.

**Mongoose:**

- The **Mongoose** schema establishes the data structure for the invite information within the database.

**Schema:**

```javascript
// Instantiate `Invite` schema
const inviteSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kind: {
      type: String,
      required: true,
      default: "other",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
  },
  { timestamps: true }
)
```

**Model:**

```javascript
// Create `Invite` model from `inviteSchema`
const Invite = mongoose.model("Invite", inviteSchema)
```

This was the visual demo for now, I will update this later on, so come back in a while to check it out!

