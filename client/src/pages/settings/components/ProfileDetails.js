import * as Yup from "yup";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogContentText,
  Divider,
  Grid,
  TextField,
} from "@material-ui/core";
import { Form, Formik } from "formik";
import React, { useLayoutEffect, useState } from "react";
import { changeUserInfo, getUserData } from "src/components/ServerRequests";

const ProfileDetails = () => {
  const [googleAccount, setGoogleAccount] = useState(false);
  const [changeUserInfoSuccess, setChangeDetailsSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  useLayoutEffect(() => {
    getUserData().then((response) => {
      if (response.data.message === "loggedIn") {
        setValues({
          firstName: response.data.user.firstname,
          lastName: response.data.user.lastname,
          email: response.data.user.email,
        });
        if (response.data.user.googleId) {
          setGoogleAccount(true);
        }
      }
    });
    setButtonDisabled(true);
  }, []);

  const handleSubmit = (values) => {
    changeUserInfo(values.firstName, values.lastName, values.email).then(
      (response) => {
        if (response.data.message === "updateSuccess") {
          setChangeDetailsSuccess(true);
        } else {
          setChangeDetailsSuccess(false);
        }
        setOpen(true);
      }
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={values}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
        firstName: Yup.string().max(255).required("First name is required"),
        lastName: Yup.string().max(255).required("Last name is required"),
      })}
      onSubmit={handleSubmit}
    >
      {({ errors, handleBlur, handleChange, touched, values }) => (
        <Form>
          <Card>
            <CardHeader
              subheader="Manage your account settings here"
              title="Profile"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.firstName && errors.firstName)}
                    fullWidth
                    helperText={touched.firstName && errors.firstName}
                    label="First name"
                    name="firstName"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      setButtonDisabled(false);
                    }}
                    value={values.firstName}
                    disabled={googleAccount}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.lastName && errors.lastName)}
                    fullWidth
                    helperText={touched.lastName && errors.lastName}
                    label="Last name"
                    name="lastName"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      setButtonDisabled(false);
                    }}
                    disabled={googleAccount}
                    value={values.lastName}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    required
                    error={Boolean(touched.email && errors.email)}
                    fullWidth
                    helperText={touched.email && errors.email}
                    label="Email address"
                    name="email"
                    disabled={googleAccount}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      setButtonDisabled(false);
                    }}
                    type="email"
                    value={values.email}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={googleAccount || buttonDisabled}
              >
                Update
              </Button>
            </Box>
          </Card>
          <Dialog
            open={open}
            onClose={() => {
              window.location.reload(false);
            }}
          >
            <Box p={1}>
              <DialogContent>
                <DialogContentText>
                  <Box
                    alignItems="center"
                    justifyContent="center"
                    display="flex"
                  >
                    {changeUserInfoSuccess
                      ? "Your details have been changed successfully!"
                      : "The email address specified is already linked to a Recipedia account! Please use another email address."}
                  </Box>
                </DialogContentText>
              </DialogContent>
            </Box>
          </Dialog>
        </Form>
      )}
    </Formik>
  );
};

export default ProfileDetails;
