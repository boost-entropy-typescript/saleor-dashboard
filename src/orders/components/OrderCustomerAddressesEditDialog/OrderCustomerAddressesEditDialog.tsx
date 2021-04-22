import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from "@material-ui/core/Typography";
import AddressEdit from "@saleor/components/AddressEdit";
import CardSpacer from "@saleor/components/CardSpacer";
import ConfirmButton, {
  ConfirmButtonTransitionState
} from "@saleor/components/ConfirmButton";
import ControlledCheckbox from "@saleor/components/ControlledCheckbox";
import Form from "@saleor/components/Form";
import FormSpacer from "@saleor/components/FormSpacer";
import CustomerAddressChoice from "@saleor/customers/components/CustomerAddressChoice";
import { AddressTypeInput } from "@saleor/customers/types";
import { CustomerAddresses_user_addresses } from "@saleor/customers/types/CustomerAddresses";
import { OrderErrorFragment } from "@saleor/fragments/types/OrderErrorFragment";
import useAddressValidation from "@saleor/hooks/useAddressValidation";
import useModalDialogErrors from "@saleor/hooks/useModalDialogErrors";
import useStateFromProps from "@saleor/hooks/useStateFromProps";
import { buttonMessages } from "@saleor/intl";
import { maybe } from "@saleor/misc";
import { makeStyles } from "@saleor/theme";
import { AddressInput } from "@saleor/types/globalTypes";
import createSingleAutocompleteSelectHandler from "@saleor/utils/handlers/singleAutocompleteSelectChangeHandler";
import React from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";

const messages = defineMessages({
  title: {
    defaultMessage: "Shipping address for order",
    description: "dialog header"
  },
  customerAddress: {
    defaultMessage: "Use one of customer addresses",
    description: "address type"
  },
  newAddress: {
    defaultMessage: "Add new address",
    description: "address type"
  },
  billingSameAsShipping: {
    defaultMessage: "Billing address same as shipping address",
    description: "checkbox label"
  },
  shippingAddressDescription: {
    defaultMessage:
      "Which address would you like to use as shipping address for selected customer:",
    description: "dialog content"
  },
  billingAddressDescription: {
    defaultMessage: "Select one of customer addresses or add a new address:",
    description: "dialog content"
  }
});

const useStyles = makeStyles(
  {
    container: {
      display: "block"
    },
    optionLabel: {
      display: "block"
    },
    overflow: {
      overflowY: "visible"
    }
  },
  { name: "OrderCustomerAddressesEditDialog" }
);

export enum AddressInputOptionEnum {
  CUSTOMER_ADDRESS = "customerAddress",
  NEW_ADDRESS = "newAddress"
}

export interface OrderCustomerAddressesEditDialogData {
  billingSameAsShipping: boolean;
  shippingAddressInputOption: AddressInputOptionEnum;
  billingAddressInputOption: AddressInputOptionEnum;
  userShippingAddress: CustomerAddresses_user_addresses;
  userBillingAddress: CustomerAddresses_user_addresses;
  shippingAddress: AddressTypeInput;
  billingAddress: AddressTypeInput;
}

export interface OrderCustomerAddressesEditDialogProps {
  confirmButtonState: ConfirmButtonTransitionState;
  data: OrderCustomerAddressesEditDialogData;
  open: boolean;
  errors: OrderErrorFragment[];
  countries?: Array<{
    code: string;
    label: string;
  }>;
  userAddresses?: CustomerAddresses_user_addresses[];
  onClose();
  onConfirm(data: AddressInput);
}

const OrderCustomerAddressesEditDialog: React.FC<OrderCustomerAddressesEditDialogProps> = props => {
  const {
    data,
    confirmButtonState,
    open,
    errors = [],
    countries = [],
    userAddresses = [],
    onClose,
    onConfirm
  } = props;

  const classes = useStyles(props);
  const intl = useIntl();
  const [countryDisplayName, setCountryDisplayName] = useStateFromProps(
    maybe(
      () =>
        countries.find(country => data.shippingAddress.country === country.code)
          .label
    )
  );
  const {
    errors: validationErrors,
    submit: handleSubmit
  } = useAddressValidation(onConfirm);
  const dialogErrors = useModalDialogErrors(
    [...errors, ...validationErrors],
    open
  );

  const countryChoices = countries.map(country => ({
    label: country.label,
    value: country.code
  }));

  return (
    <Dialog onClose={onClose} open={open}>
      <Form initial={data} onSubmit={handleSubmit}>
        {({ change, data }) => {
          const handleCountrySelect = createSingleAutocompleteSelectHandler(
            change,
            setCountryDisplayName,
            countryChoices
          );

          return (
            <>
              <DialogTitle>
                <FormattedMessage {...messages.title} />
              </DialogTitle>
              <DialogContent className={classes.overflow}>
                <Typography>
                  <FormattedMessage {...messages.shippingAddressDescription} />
                </Typography>
                <FormSpacer />
                <RadioGroup
                  className={classes.container}
                  value={data.shippingAddressInputOption}
                  name="shippingAddressInputOption"
                  onChange={event => change(event)}
                >
                  <FormControlLabel
                    value={AddressInputOptionEnum.CUSTOMER_ADDRESS}
                    control={<Radio color="primary" />}
                    label={intl.formatMessage(messages.customerAddress)}
                    className={classes.optionLabel}
                  />
                  {data.shippingAddressInputOption ===
                    AddressInputOptionEnum.CUSTOMER_ADDRESS && (
                    <>
                      {userAddresses.map(userAddress => (
                        <>
                          <CardSpacer />
                          <CustomerAddressChoice
                            address={userAddress}
                            selected={
                              userAddress.id === data.userShippingAddress.id
                            }
                            onSelect={() =>
                              change({
                                target: {
                                  name: "userShippingAddress",
                                  value: userAddress
                                }
                              })
                            }
                          />
                        </>
                      ))}
                      <FormSpacer />
                    </>
                  )}
                  <FormControlLabel
                    value={AddressInputOptionEnum.NEW_ADDRESS}
                    control={<Radio color="primary" />}
                    label={intl.formatMessage(messages.newAddress)}
                    className={classes.optionLabel}
                  />
                  {data.shippingAddressInputOption ===
                    AddressInputOptionEnum.NEW_ADDRESS && (
                    <>
                      <FormSpacer />
                      <AddressEdit
                        countries={countryChoices}
                        countryDisplayValue={countryDisplayName}
                        data={data.shippingAddress}
                        errors={dialogErrors}
                        onChange={change}
                        onCountryChange={handleCountrySelect}
                      />
                    </>
                  )}
                </RadioGroup>
                <FormSpacer />
                <Divider />
                <FormSpacer />
                <ControlledCheckbox
                  checked={data.billingSameAsShipping}
                  name="billingSameAsShipping"
                  label={intl.formatMessage(messages.billingSameAsShipping)}
                  onChange={change}
                />
                {!data.billingSameAsShipping && (
                  <>
                    <FormSpacer />
                    <Typography>
                      <FormattedMessage
                        {...messages.billingAddressDescription}
                      />
                    </Typography>
                    <FormSpacer />
                    <RadioGroup
                      className={classes.container}
                      value={data.billingAddressInputOption}
                      name="billingAddressInputOption"
                      onChange={event => change(event)}
                    >
                      <FormControlLabel
                        value={AddressInputOptionEnum.CUSTOMER_ADDRESS}
                        control={<Radio color="primary" />}
                        label={intl.formatMessage(messages.customerAddress)}
                        className={classes.optionLabel}
                      />
                      {data.billingAddressInputOption ===
                        AddressInputOptionEnum.CUSTOMER_ADDRESS && (
                        <>
                          {userAddresses.map(userAddress => (
                            <>
                              <CardSpacer />
                              <CustomerAddressChoice
                                address={userAddress}
                                selected={
                                  userAddress.id === data.userBillingAddress.id
                                }
                                onSelect={() =>
                                  change({
                                    target: {
                                      name: "userBillingAddress",
                                      value: userAddress
                                    }
                                  })
                                }
                              />
                            </>
                          ))}
                          <FormSpacer />
                        </>
                      )}
                      <FormControlLabel
                        value={AddressInputOptionEnum.NEW_ADDRESS}
                        control={<Radio color="primary" />}
                        label={intl.formatMessage(messages.newAddress)}
                        className={classes.optionLabel}
                      />
                      {data.billingAddressInputOption ===
                        AddressInputOptionEnum.NEW_ADDRESS && (
                        <>
                          <FormSpacer />
                          <AddressEdit
                            countries={countryChoices}
                            countryDisplayValue={countryDisplayName}
                            data={data.billingAddress}
                            errors={dialogErrors}
                            onChange={change}
                            onCountryChange={handleCountrySelect}
                          />
                        </>
                      )}
                    </RadioGroup>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <ConfirmButton
                  transitionState={confirmButtonState}
                  color="primary"
                  variant="contained"
                  type="submit"
                >
                  <FormattedMessage {...buttonMessages.select} />
                </ConfirmButton>
              </DialogActions>
            </>
          );
        }}
      </Form>
    </Dialog>
  );
};

OrderCustomerAddressesEditDialog.displayName =
  "OrderCustomerAddressesEditDialog";
export default OrderCustomerAddressesEditDialog;
