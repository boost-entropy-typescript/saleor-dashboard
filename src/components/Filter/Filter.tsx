import ButtonBase from "@material-ui/core/ButtonBase";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Popper from "@material-ui/core/Popper";
import { fade } from "@material-ui/core/styles/colorManipulator";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@saleor/theme";
import classNames from "classnames";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { FilterContent } from ".";
import { FilterErrorMessages, IFilter, IFilterElement } from "./types";
import useFilter from "./useFilter";
import { isFilterValid } from "./utils";

export interface FilterProps<TFilterKeys extends string = string> {
  currencySymbol?: string;
  errorMessages?: FilterErrorMessages;
  menu: IFilter<TFilterKeys>;
  onFilterAdd: (filter: Array<IFilterElement<string>>) => void;
}

const useStyles = makeStyles(
  theme => ({
    addFilterButton: {
      "&$filterButton": {
        "&:hover, &:focus": {
          backgroundColor: fade(theme.palette.primary.main, 0.1)
        },
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}`,
        cursor: "pointer",
        marginBottom: 0,
        marginRight: theme.spacing(2),
        marginTop: 0,
        transition: theme.transitions.duration.short + "ms"
      }
    },
    addFilterButtonActive: {
      "&$addFilterButton": {
        backgroundColor: fade(theme.palette.primary.main, 0.1)
      }
    },
    addFilterIcon: {
      transition: theme.transitions.duration.short + "ms"
    },
    addFilterText: {
      color: theme.palette.primary.main,
      fontSize: 14,
      fontWeight: 600 as 600,
      textTransform: "uppercase"
    },
    filterButton: {
      alignItems: "center",
      backgroundColor: fade(theme.palette.primary.main, 0.6),
      borderRadius: "4px",
      display: "flex",
      height: 40,
      justifyContent: "space-around",
      margin: theme.spacing(2, 1),
      marginLeft: 0,
      padding: theme.spacing(0, 2),
      position: "relative"
    },
    paper: {
      "& p": {
        paddingBottom: 10
      },
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
      width: 240
    },
    popover: {
      width: 376,
      zIndex: 3
    },
    rotate: {
      transform: "rotate(180deg)"
    },
    separator: {
      backgroundColor: theme.palette.primary.main,
      display: "inline-block",
      height: 28,
      margin: theme.spacing(0, 1.5, 0, 1),
      width: 1
    }
  }),
  { name: "Filter" }
);
const Filter: React.FC<FilterProps> = props => {
  const { currencySymbol, menu, onFilterAdd, errorMessages } = props;
  const classes = useStyles(props);

  const anchor = React.useRef<HTMLDivElement>();
  const [isFilterMenuOpened, setFilterMenuOpened] = useState(false);
  const [filterErrors, setFilterErrors] = useState<string[]>([]);
  const [data, dispatch, reset] = useFilter(menu);

  const isFilterActive = menu.some(filterElement => filterElement.active);

  const handleSubmit = () => {
    const invalidFilters = data.filter(filter => !isFilterValid(filter));

    if (!invalidFilters.length) {
      setFilterErrors([]);
      onFilterAdd(data);
      setFilterMenuOpened(false);
    }

    const parsedFilterErrors = invalidFilters.map(({ name }) => name);

    setFilterErrors(parsedFilterErrors);
  };

  return (
    <ClickAwayListener
      onClickAway={event => {
        if ((event.target as HTMLElement).getAttribute("role") !== "option") {
          setFilterMenuOpened(false);
        }
      }}
    >
      <div ref={anchor}>
        <ButtonBase
          className={classNames(classes.filterButton, classes.addFilterButton, {
            [classes.addFilterButtonActive]:
              isFilterMenuOpened || isFilterActive
          })}
          onClick={() => setFilterMenuOpened(!isFilterMenuOpened)}
          data-test-id="show-filters-button"
        >
          <Typography className={classes.addFilterText}>
            <FormattedMessage defaultMessage="Filters" description="button" />
          </Typography>
          {isFilterActive && (
            <>
              <span className={classes.separator} />
              <Typography className={classes.addFilterText}>
                {menu.reduce((acc, filterElement) => {
                  const dataFilterElement = data.find(
                    ({ name }) => name === filterElement.name
                  );

                  return acc + (dataFilterElement.active ? 1 : 0);
                }, 0)}
              </Typography>
            </>
          )}
        </ButtonBase>
        <Popper
          className={classes.popover}
          open={isFilterMenuOpened}
          anchorEl={anchor.current}
          transition
          disablePortal
          placement="bottom-start"
          modifiers={{
            flip: {
              enabled: false
            },
            hide: {
              enabled: false
            },
            preventOverflow: {
              boundariesElement: "scrollParent",
              enabled: false
            }
          }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "right top" : "right bottom"
              }}
            >
              <FilterContent
                errorMessages={errorMessages}
                errors={filterErrors}
                dataStructure={menu}
                currencySymbol={currencySymbol}
                filters={data}
                onClear={reset}
                onFilterPropertyChange={dispatch}
                onSubmit={handleSubmit}
              />
            </Grow>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  );
};
Filter.displayName = "Filter";
export default Filter;
