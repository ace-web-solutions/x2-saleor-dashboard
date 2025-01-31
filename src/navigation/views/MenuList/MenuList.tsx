import { Button, DialogContentText } from "@material-ui/core";
import ActionDialog from "@saleor/components/ActionDialog";
import { DEFAULT_INITIAL_PAGINATION_DATA } from "@saleor/config";
import { configurationMenuUrl } from "@saleor/configuration";
import useBulkActions from "@saleor/hooks/useBulkActions";
import useListSettings from "@saleor/hooks/useListSettings";
import useNavigator from "@saleor/hooks/useNavigator";
import useNotifier from "@saleor/hooks/useNotifier";
import { usePaginationReset } from "@saleor/hooks/usePaginationReset";
import usePaginator, {
  createPaginationState
} from "@saleor/hooks/usePaginator";
import { buttonMessages, commonMessages } from "@saleor/intl";
import { getStringOrPlaceholder, maybe } from "@saleor/misc";
import { getById } from "@saleor/orders/components/OrderReturnPage/utils";
import { ListViews } from "@saleor/types";
import createSortHandler from "@saleor/utils/handlers/sortHandler";
import { mapEdgesToItems } from "@saleor/utils/maps";
import { getSortParams } from "@saleor/utils/sort";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import MenuCreateDialog from "../../components/MenuCreateDialog";
import MenuListPage from "../../components/MenuListPage";
import {
  MenuBulkDeleteMutation,
  MenuCreateMutation,
  MenuDeleteMutation
} from "../../mutations";
import { useMenuListQuery } from "../../queries";
import { MenuBulkDelete } from "../../types/MenuBulkDelete";
import { MenuCreate } from "../../types/MenuCreate";
import { MenuDelete } from "../../types/MenuDelete";
import { menuListUrl, MenuListUrlQueryParams, menuUrl } from "../../urls";
import { getSortQueryVariables } from "./sort";

interface MenuListProps {
  params: MenuListUrlQueryParams;
}
const MenuList: React.FC<MenuListProps> = ({ params }) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const paginate = usePaginator();
  const { isSelected, listElements, reset, toggle, toggleAll } = useBulkActions(
    params.ids
  );
  const { updateListSettings, settings } = useListSettings(
    ListViews.NAVIGATION_LIST
  );

  usePaginationReset(
    menuListUrl({
      ...params,
      ...DEFAULT_INITIAL_PAGINATION_DATA
    }),
    settings.rowNumber
  );

  const intl = useIntl();

  const closeModal = () =>
    navigate(
      menuListUrl({
        ...params,
        action: undefined,
        id: undefined,
        ids: undefined
      }),
      { replace: true }
    );

  const paginationState = createPaginationState(settings.rowNumber, params);
  const queryVariables = React.useMemo(
    () => ({
      ...paginationState,
      sort: getSortQueryVariables(params)
    }),
    [params, settings.rowNumber]
  );
  const { data, loading, refetch } = useMenuListQuery({
    displayLoader: true,
    variables: queryVariables
  });

  const { loadNextPage, loadPreviousPage, pageInfo } = paginate(
    maybe(() => data.menus.pageInfo),
    paginationState,
    params
  );

  const handleCreate = (data: MenuCreate) => {
    if (data.menuCreate.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage({
          defaultMessage: "Created menu",
          id: "menuListCreatedMenu"
        })
      });
      navigate(menuUrl(data.menuCreate.menu.id));
    }
  };

  const handleBulkDelete = (data: MenuBulkDelete) => {
    if (data.menuBulkDelete.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges)
      });
      closeModal();
      reset();
      refetch();
    }
  };

  const handleDelete = (data: MenuDelete) => {
    if (data.menuDelete.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage({
          defaultMessage: "Deleted menu",
          id: "menuListDeletedMenu"
        })
      });
      closeModal();
      refetch();
    }
  };

  const handleSort = createSortHandler(navigate, menuListUrl, params);

  return (
    <MenuCreateMutation onCompleted={handleCreate}>
      {(menuCreate, menuCreateOpts) => (
        <MenuDeleteMutation onCompleted={handleDelete}>
          {(menuDelete, menuDeleteOpts) => (
            <MenuBulkDeleteMutation onCompleted={handleBulkDelete}>
              {(menuBulkDelete, menuBulkDeleteOpts) => (
                <>
                  <MenuListPage
                    disabled={loading}
                    menus={mapEdgesToItems(data?.menus)}
                    settings={settings}
                    onAdd={() =>
                      navigate(
                        menuListUrl({
                          action: "add"
                        })
                      )
                    }
                    onBack={() => navigate(configurationMenuUrl)}
                    onDelete={id =>
                      navigate(
                        menuListUrl({
                          action: "remove",
                          id
                        })
                      )
                    }
                    onNextPage={loadNextPage}
                    onPreviousPage={loadPreviousPage}
                    onUpdateListSettings={updateListSettings}
                    onRowClick={id => () => navigate(menuUrl(id))}
                    onSort={handleSort}
                    pageInfo={pageInfo}
                    isChecked={isSelected}
                    selected={listElements.length}
                    sort={getSortParams(params)}
                    toggle={toggle}
                    toggleAll={toggleAll}
                    toolbar={
                      <Button
                        color="primary"
                        onClick={() =>
                          navigate(
                            menuListUrl({
                              ...params,
                              action: "remove-many",
                              ids: listElements
                            })
                          )
                        }
                      >
                        <FormattedMessage {...buttonMessages.remove} />
                      </Button>
                    }
                  />
                  <MenuCreateDialog
                    open={params.action === "add"}
                    confirmButtonState={menuCreateOpts.status}
                    disabled={menuCreateOpts.loading}
                    errors={menuCreateOpts?.data?.menuCreate.errors || []}
                    onClose={closeModal}
                    onConfirm={formData =>
                      menuCreate({
                        variables: { input: formData }
                      })
                    }
                  />
                  <ActionDialog
                    open={params.action === "remove"}
                    onClose={closeModal}
                    confirmButtonState={menuDeleteOpts.status}
                    onConfirm={() =>
                      menuDelete({
                        variables: {
                          id: params.id
                        }
                      })
                    }
                    variant="delete"
                    title={intl.formatMessage({
                      defaultMessage: "Delete Menu",
                      description: "dialog header",
                      id: "menuListDeleteMenuHeader"
                    })}
                  >
                    <DialogContentText>
                      <FormattedMessage
                        defaultMessage="Are you sure you want to delete {menuName}?"
                        id="menuListDeleteMenuContent"
                        values={{
                          menuName: getStringOrPlaceholder(
                            mapEdgesToItems(data?.menus)?.find(
                              getById(params.id)
                            )?.name
                          )
                        }}
                      />
                    </DialogContentText>
                  </ActionDialog>
                  <ActionDialog
                    open={
                      params.action === "remove-many" &&
                      maybe(() => params.ids.length > 0)
                    }
                    onClose={closeModal}
                    confirmButtonState={menuBulkDeleteOpts.status}
                    onConfirm={() =>
                      menuBulkDelete({
                        variables: {
                          ids: params.ids
                        }
                      })
                    }
                    variant="delete"
                    title={intl.formatMessage({
                      defaultMessage: "Delete Menus",
                      description: "dialog header",
                      id: "menuListDeleteMenusHeader"
                    })}
                  >
                    <DialogContentText>
                      <FormattedMessage
                        defaultMessage="{counter,plural,one{Are you sure you want to delete this menu?} other{Are you sure you want to delete {displayQuantity} menus?}}"
                        id="menuListDeleteMenusContent"
                        values={{
                          counter: maybe(
                            () => params.ids.length.toString(),
                            "..."
                          ),
                          displayQuantity: (
                            <strong>
                              {maybe(() => params.ids.length.toString(), "...")}
                            </strong>
                          )
                        }}
                      />
                    </DialogContentText>
                  </ActionDialog>
                </>
              )}
            </MenuBulkDeleteMutation>
          )}
        </MenuDeleteMutation>
      )}
    </MenuCreateMutation>
  );
};
export default MenuList;
