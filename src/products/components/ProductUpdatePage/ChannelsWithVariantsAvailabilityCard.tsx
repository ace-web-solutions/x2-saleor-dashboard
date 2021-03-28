import { ChannelData } from "@saleor/channels/utils";
import ChannelContent from "@saleor/components/ChannelsAvailability/ChannelContent";
import ChannelsAvailabilityWrapper, {
  ChannelsAvailabilityWrapperProps
} from "@saleor/components/ChannelsAvailability/ChannelsAvailabilityWrapper";
import {
  ChannelsAvailabilityError,
  ChannelValue,
  Message
} from "@saleor/components/ChannelsAvailability/types";
import { getChannelsAvailabilityMessages } from "@saleor/components/ChannelsAvailability/utils";
import useDateLocalize from "@saleor/hooks/useDateLocalize";
import { getById } from "@saleor/orders/components/OrderReturnPage/utils";
import { ProductDetails_product_variants } from "@saleor/products/types/ProductDetails";
import { ChannelsWithVariantsData } from "@saleor/products/views/ProductUpdate/types";
import {
  areAnyChannelVariantsSelected,
  getTotalSelectedChannelsCount
} from "@saleor/products/views/ProductUpdate/utils";
import React from "react";
import { useIntl } from "react-intl";

import ChannelWithVariantsAvailabilityItemWrapper from "./ChannelWithVariantAvailabilityItemWrapper";

interface ChannelsWithVariantsAvailabilityCardProps
  extends Omit<
    ChannelsAvailabilityWrapperProps,
    "children" | "selectedChannelsCount" | "allChannelsCount"
  > {
  channelsWithVariantsData: ChannelsWithVariantsData;
  channels: ChannelData[];
  variants: ProductDetails_product_variants[];
  errors?: ChannelsAvailabilityError[];
  messages: Message;
  onChange: (id: string, data: ChannelValue) => void;
}

const ChannelsWithVariantsAvailabilityCard: React.FC<ChannelsWithVariantsAvailabilityCardProps> = ({
  channels,
  channelsWithVariantsData,
  openModal,
  variants,
  errors,
  messages,
  onChange
}) => {
  const intl = useIntl();
  const localizeDate = useDateLocalize();

  const channelsMessages = getChannelsAvailabilityMessages({
    messages,
    channels,
    intl,
    localizeDate
  });

  const allChannelsCount = channels.length;

  const selectedChannelsCount = getTotalSelectedChannelsCount(
    channelsWithVariantsData
  );

  return (
    <ChannelsAvailabilityWrapper
      selectedChannelsCount={selectedChannelsCount}
      allChannelsCount={allChannelsCount}
      openModal={openModal}
    >
      {channels
        .filter(({ id }) =>
          areAnyChannelVariantsSelected(channelsWithVariantsData[id])
        )
        .map(({ id }) => (
          <ChannelWithVariantsAvailabilityItemWrapper
            messages={channelsMessages[id]}
            key={id}
            channelsWithVariantsData={channelsWithVariantsData}
            variants={variants}
            channels={channels}
            channelId={id}
          >
            <ChannelContent
              onChange={onChange}
              data={channels.find(getById(id))}
              errors={errors}
              messages={channelsMessages[id]}
            />
          </ChannelWithVariantsAvailabilityItemWrapper>
        ))}
    </ChannelsAvailabilityWrapper>
  );
};

export default ChannelsWithVariantsAvailabilityCard;
