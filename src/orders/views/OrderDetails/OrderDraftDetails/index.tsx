import { WindowTitle } from "@saleor/components/WindowTitle";
import { DEFAULT_INITIAL_SEARCH_DATA } from "@saleor/config";
import { useCustomerAddressesQuery } from "@saleor/customers/queries";
import useNavigator from "@saleor/hooks/useNavigator";
import useUser from "@saleor/hooks/useUser";
import OrderCustomerAddressesEditDialog from "@saleor/orders/components/OrderCustomerAddressesEditDialog";
import { CustomerChangeActionEnum } from "@saleor/orders/components/OrderCustomerChangeDialog/form";
import OrderCustomerChangeDialog from "@saleor/orders/components/OrderCustomerChangeDialog/OrderCustomerChangeDialog";
import { OrderDetails } from "@saleor/orders/types/OrderDetails";
import { OrderDiscountProvider } from "@saleor/products/components/OrderDiscountProviders/OrderDiscountProvider";
import { OrderLineDiscountProvider } from "@saleor/products/components/OrderDiscountProviders/OrderLineDiscountProvider";
import useCustomerSearch from "@saleor/searches/useCustomerSearch";
import React from "react";
import { useIntl } from "react-intl";

import { customerUrl } from "../../../../customers/urls";
import {
  getStringOrPlaceholder,
  transformFormToAddress
} from "../../../../misc";
import { productUrl } from "../../../../products/urls";
import OrderDraftCancelDialog from "../../../components/OrderDraftCancelDialog/OrderDraftCancelDialog";
import OrderDraftPage from "../../../components/OrderDraftPage";
import OrderProductAddDialog from "../../../components/OrderProductAddDialog";
import OrderShippingMethodEditDialog from "../../../components/OrderShippingMethodEditDialog";
import { useOrderVariantSearch } from "../../../queries";
import { OrderUrlDialog, OrderUrlQueryParams } from "../../../urls";
import { orderDraftListUrl } from "../../../urls";

interface OrderDraftDetailsProps {
  id: string;
  params: OrderUrlQueryParams;
  loading: any;
  data: OrderDetails;
  orderAddNote: any;
  orderLineUpdate: any;
  orderLineDelete: any;
  orderShippingMethodUpdate: any;
  orderLinesAdd: any;
  orderDraftUpdate: any;
  orderDraftCancel: any;
  orderDraftFinalize: any;
  openModal: (action: OrderUrlDialog, newParams?: OrderUrlQueryParams) => void;
  closeModal: any;
}

export const OrderDraftDetails: React.FC<OrderDraftDetailsProps> = ({
  id,
  params,
  loading,
  data,
  orderAddNote,
  orderLineUpdate,
  orderLineDelete,
  orderShippingMethodUpdate,
  orderLinesAdd,
  orderDraftUpdate,
  orderDraftCancel,
  orderDraftFinalize,
  openModal,
  closeModal
}) => {
  const order = data.order;
  const navigate = useNavigator();
  const { user } = useUser();

  const {
    loadMore,
    search: variantSearch,
    result: variantSearchOpts
  } = useOrderVariantSearch({
    variables: { ...DEFAULT_INITIAL_SEARCH_DATA, channel: order.channel.slug }
  });

  const {
    loadMore: loadMoreCustomers,
    search: searchUsers,
    result: users
  } = useCustomerSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA
  });

  const { data: customerAddresses } = useCustomerAddressesQuery({
    variables: {
      id: order.user.id
    },
    skip: params.action !== "edit-customer-addresses"
  });

  const countries = (data?.shop?.countries || []).map(country => ({
    code: country.code,
    label: country.country
  }));

  const intl = useIntl();

  return (
    <>
      <WindowTitle
        title={intl.formatMessage(
          {
            defaultMessage: "Draft Order #{orderNumber}",
            description: "window title"
          },
          {
            orderNumber: getStringOrPlaceholder(data?.order?.number)
          }
        )}
      />

      <OrderDiscountProvider order={order}>
        <OrderLineDiscountProvider order={order}>
          <OrderDraftPage
            disabled={loading}
            onNoteAdd={variables =>
              orderAddNote.mutate({
                input: variables,
                order: id
              })
            }
            users={users?.data?.search?.edges?.map(edge => edge.node) || []}
            hasMore={users?.data?.search?.pageInfo?.hasNextPage || false}
            onFetchMore={loadMoreCustomers}
            fetchUsers={searchUsers}
            loading={users.loading}
            usersLoading={users.loading}
            onCustomerEdit={async data => {
              const result = await orderDraftUpdate.mutate({
                id,
                input: {
                  user: data.user
                }
              });
              if (!result?.data?.draftOrderUpdate?.errors?.length) {
                openModal("customer-change");
              } else {
                closeModal();
              }
            }}
            onDraftFinalize={() => orderDraftFinalize.mutate({ id })}
            onDraftRemove={() => openModal("cancel")}
            onOrderLineAdd={() => openModal("add-order-line")}
            onBack={() => navigate(orderDraftListUrl())}
            order={order}
            countries={countries}
            onProductClick={id => () =>
              navigate(productUrl(encodeURIComponent(id)))}
            onBillingAddressEdit={() => openModal("edit-billing-address")}
            onShippingAddressEdit={() => openModal("edit-shipping-address")}
            onShippingMethodEdit={() => openModal("edit-shipping")}
            onOrderLineRemove={id => orderLineDelete.mutate({ id })}
            onOrderLineChange={(id, data) =>
              orderLineUpdate.mutate({
                id,
                input: data
              })
            }
            saveButtonBarState="default"
            onProfileView={() => navigate(customerUrl(order.user.id))}
            userPermissions={user?.userPermissions || []}
          />
        </OrderLineDiscountProvider>
      </OrderDiscountProvider>
      <OrderDraftCancelDialog
        confirmButtonState={orderDraftCancel.opts.status}
        errors={orderDraftCancel.opts.data?.draftOrderDelete.errors || []}
        onClose={closeModal}
        onConfirm={() => orderDraftCancel.mutate({ id })}
        open={params.action === "cancel"}
        orderNumber={getStringOrPlaceholder(order?.number)}
      />
      <OrderShippingMethodEditDialog
        confirmButtonState={orderShippingMethodUpdate.opts.status}
        errors={
          orderShippingMethodUpdate.opts.data?.orderUpdateShipping.errors || []
        }
        open={params.action === "edit-shipping"}
        shippingMethod={order?.shippingMethod?.id}
        shippingMethods={order?.availableShippingMethods}
        onClose={closeModal}
        onSubmit={variables =>
          orderShippingMethodUpdate.mutate({
            id,
            input: {
              shippingMethod: variables.shippingMethod
            }
          })
        }
      />
      <OrderProductAddDialog
        confirmButtonState={orderLinesAdd.opts.status}
        errors={orderLinesAdd.opts.data?.orderLinesCreate.errors || []}
        loading={variantSearchOpts.loading}
        open={params.action === "add-order-line"}
        hasMore={variantSearchOpts.data?.search.pageInfo.hasNextPage}
        products={variantSearchOpts.data?.search.edges.map(edge => edge.node)}
        selectedChannelId={order?.channel?.id}
        onClose={closeModal}
        onFetch={variantSearch}
        onFetchMore={loadMore}
        onSubmit={variants =>
          orderLinesAdd.mutate({
            id,
            input: variants.map(variant => ({
              quantity: 1,
              variantId: variant.id
            }))
          })
        }
      />
      <OrderCustomerChangeDialog
        open={params.action === "customer-change"}
        onClose={closeModal}
        onConfirm={data => {
          if (
            data.changeActionOption === CustomerChangeActionEnum.CHANGE_ADDRESS
          ) {
            openModal("edit-customer-addresses");
          } else {
            closeModal();
          }
        }}
      />
      <OrderCustomerAddressesEditDialog
        open={params.action === "edit-customer-addresses"}
        confirmButtonState={orderDraftUpdate.opts.status}
        errors={orderDraftUpdate.opts.data?.draftOrderUpdate?.errors || []}
        countries={countries}
        customerAddresses={customerAddresses?.user?.addresses}
        defaultShippingAddress={customerAddresses?.user?.defaultShippingAddress}
        defaultBillingAddress={customerAddresses?.user?.defaultBillingAddress}
        onClose={closeModal}
        onConfirm={async data => {
          const result = await orderDraftUpdate.mutate({
            id,
            input: {
              shippingAddress: transformFormToAddress(data.shippingAddress),
              billingAddress: transformFormToAddress(data.billingAddress)
            }
          });
          if (!result?.data?.draftOrderUpdate?.errors?.length) {
            closeModal();
          }
          return result;
        }}
      />
    </>
  );
};

export default OrderDraftDetails;
