import { CardContent, Divider, Typography } from "@material-ui/core";
import CardSpacer from "@saleor/components/CardSpacer";
import CollectionWithDividers from "@saleor/components/CollectionWithDividers";
import StatusLabel from "@saleor/components/StatusLabel";
import { statusLabelMessages } from "@saleor/components/StatusLabel/messages";
import { Plugin_plugin } from "@saleor/plugins/types/Plugin";
import React from "react";
import { useIntl } from "react-intl";

import { channelConfigPluginMessages as messages } from "../messages";
import {
  getActiveChannelConfigsCount,
  getAllChannelConfigsCount
} from "../utils";
import ScrollableContent from "./ScrollableContent";

interface ChannelConfigPluginPopupBodyProps {
  plugin: Plugin_plugin;
}

const ChannelConfigPluginPopupBody: React.FC<ChannelConfigPluginPopupBodyProps> = ({
  plugin: { channelConfigurations }
}) => {
  const intl = useIntl();

  return (
    <>
      <CardContent>
        <Typography>
          {intl.formatMessage(messages.title, {
            allChannelsCount: getAllChannelConfigsCount(channelConfigurations),
            activeChannelsCount: getActiveChannelConfigsCount(
              channelConfigurations
            )
          })}
        </Typography>
      </CardContent>
      <Divider />
      <ScrollableContent>
        <CardContent>
          <CollectionWithDividers
            collection={channelConfigurations}
            renderDivider={() => <CardSpacer />}
            renderItem={({ channel, active }) => (
              <StatusLabel
                key={channel.id}
                label={channel.name}
                status={active ? "success" : "error"}
                subtitle={intl.formatMessage(
                  active
                    ? statusLabelMessages.active
                    : statusLabelMessages.inactive
                )}
              />
            )}
          />
        </CardContent>
      </ScrollableContent>
    </>
  );
};

export default ChannelConfigPluginPopupBody;
